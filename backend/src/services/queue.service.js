import { fn, col } from 'sequelize';
import { models } from '../models/index.js';
import { assertProjectAccess, assertQueueAccess, hasPlatformRole } from './access.service.js';
import { notFound } from '../utils/httpError.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';

export async function listQueues(user, query) {
  const options = buildListOptions(query, ['name', 'slug'], ['createdAt', 'name', 'priority']);
  applyExactFilters(options.where, query, ['projectId', 'status']);
  if (!hasPlatformRole(user) && !query.projectId) {
    const memberships = await models.ProjectMember.findAll({ where: { userId: user.id }, attributes: ['projectId'] });
    options.where.projectId = memberships.map((membership) => membership.projectId);
  }
  if (query.projectId) await assertProjectAccess(user, query.projectId);
  const result = await models.JobQueue.findAndCountAll({
    ...options,
    include: [{ model: models.Project, as: 'project' }, { model: models.RetryPolicy, as: 'retryPolicy' }],
    distinct: true
  });
  return paginatedResponse(result, options);
}

export async function createQueue(user, payload) {
  await assertProjectAccess(user, payload.projectId, true);
  return models.JobQueue.create(payload);
}

export async function getQueue(user, id) {
  await assertQueueAccess(user, id);
  const queue = await models.JobQueue.findByPk(id, {
    include: [{ model: models.Project, as: 'project' }, { model: models.RetryPolicy, as: 'retryPolicy' }]
  });
  if (!queue) throw notFound('Queue');
  return queue;
}

export async function updateQueue(user, id, payload) {
  const queue = await assertQueueAccess(user, id, true);
  await queue.update(payload);
  return queue;
}

export async function deleteQueue(user, id) {
  const queue = await assertQueueAccess(user, id, true);
  await queue.destroy();
  return { deleted: true };
}

export async function pauseQueue(user, id) {
  const queue = await assertQueueAccess(user, id, true);
  await queue.update({ status: 'PAUSED' });
  return queue;
}

export async function resumeQueue(user, id) {
  const queue = await assertQueueAccess(user, id, true);
  await queue.update({ status: 'ACTIVE' });
  return queue;
}

export async function queueStatistics(user, id) {
  const queue = await assertQueueAccess(user, id);
  const statusCounts = await models.Job.findAll({
    where: { queueId: id },
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status']
  });
  const active = await models.Job.count({ where: { queueId: id, status: ['CLAIMED', 'RUNNING'] } });
  const completed = await models.JobExecution.findAll({
    include: [{ model: models.Job, as: 'job', where: { queueId: id }, attributes: [] }],
    attributes: [[fn('AVG', col('duration_ms')), 'averageDurationMs'], [fn('COUNT', col('JobExecution.id')), 'executions']]
  });

  return {
    queue,
    activeJobs: active,
    availableConcurrency: Math.max(queue.concurrencyLimit - active, 0),
    statuses: statusCounts.map((row) => ({ status: row.status, count: Number(row.get('count')) })),
    executionMetrics: completed[0]?.toJSON() || { averageDurationMs: null, executions: 0 }
  };
}
