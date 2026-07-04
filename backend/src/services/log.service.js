import { models } from '../models/index.js';
import { assertQueueAccess } from './access.service.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';

export async function listJobLogs(user, query) {
  const options = buildListOptions(query, ['message'], ['createdAt', 'level']);
  applyExactFilters(options.where, query, ['jobId', 'level']);
  const include = [{ model: models.Job, as: 'job', attributes: ['id', 'queueId', 'name', 'status'] }];
  const result = await models.JobLog.findAndCountAll({ ...options, include, distinct: true });
  if (query.jobId && result.rows[0]?.job) await assertQueueAccess(user, result.rows[0].job.queueId);
  return paginatedResponse(result, options);
}

export async function listWorkerLogs(query) {
  const options = buildListOptions(query, ['message'], ['createdAt', 'level']);
  applyExactFilters(options.where, query, ['workerId', 'level']);
  return paginatedResponse(await models.WorkerLog.findAndCountAll({
    ...options,
    include: [{ model: models.Worker, as: 'worker', attributes: ['id', 'name', 'hostname', 'status'] }],
    distinct: true
  }), options);
}

export async function listExecutions(user, query) {
  const options = buildListOptions(query, ['errorMessage'], ['createdAt', 'startedAt', 'finishedAt', 'status']);
  applyExactFilters(options.where, query, ['jobId', 'workerId', 'status']);
  const result = await models.JobExecution.findAndCountAll({
    ...options,
    include: [{ model: models.Job, as: 'job', attributes: ['id', 'queueId', 'name', 'status'] }, { model: models.Worker, as: 'worker' }],
    distinct: true
  });
  if (query.jobId && result.rows[0]?.job) await assertQueueAccess(user, result.rows[0].job.queueId);
  return paginatedResponse(result, options);
}
