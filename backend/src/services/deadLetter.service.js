import { models, sequelize } from '../models/index.js';
import { assertQueueAccess } from './access.service.js';
import { notFound } from '../utils/httpError.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';
import { emitSystemEvent } from '../socket/index.js';

export async function listDeadLetterJobs(user, query) {
  const options = buildListOptions(query, ['failureReason'], ['createdAt', 'failedAt']);
  applyExactFilters(options.where, query, ['queueId']);
  if (query.queueId) await assertQueueAccess(user, query.queueId);
  const result = await models.DeadLetterJob.findAndCountAll({
    ...options,
    include: [{ model: models.Job, as: 'job' }, { model: models.JobQueue, as: 'queue' }],
    distinct: true
  });
  return paginatedResponse(result, options);
}

export async function getDeadLetterJob(user, id) {
  const dlq = await models.DeadLetterJob.findByPk(id, {
    include: [{ model: models.Job, as: 'job', include: [{ model: models.JobLog, as: 'logs' }, { model: models.RetryHistory, as: 'retryHistory' }] }, { model: models.JobQueue, as: 'queue' }]
  });
  if (!dlq) throw notFound('Dead letter job');
  await assertQueueAccess(user, dlq.queueId);
  return dlq;
}

export async function retryDeadLetterJob(user, id) {
  return sequelize.transaction(async (transaction) => {
    const dlq = await models.DeadLetterJob.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!dlq) throw notFound('Dead letter job');
    await assertQueueAccess(user, dlq.queueId, true, true);
    const job = await models.Job.findByPk(dlq.jobId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!job) throw notFound('Job');
    await job.update({
      status: 'QUEUED',
      runAt: new Date(),
      nextRetryAt: null,
      lockedByWorkerId: null,
      claimedAt: null,
      startedAt: null,
      failedAt: null,
      lastError: null
    }, { transaction });
    await dlq.update({ replayedAt: new Date() }, { transaction });
    await models.JobLog.create({ jobId: job.id, level: 'WARN', message: 'Dead-letter job replayed' }, { transaction });
    emitSystemEvent('dead-letter:retried', { deadLetterJobId: id, jobId: job.id });
    return job;
  });
}

export async function deleteDeadLetterJob(user, id) {
  const dlq = await models.DeadLetterJob.findByPk(id);
  if (!dlq) throw notFound('Dead letter job');
  await assertQueueAccess(user, dlq.queueId, true, true);
  await dlq.destroy();
  return { deleted: true };
}
