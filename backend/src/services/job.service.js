import crypto from 'crypto';
import { Op } from 'sequelize';
import { models, sequelize } from '../models/index.js';
import { assertQueueAccess } from './access.service.js';
import { calculateRetryDelay } from './retryPolicy.service.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { applyExactFilters, buildListOptions } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';
import { emitSystemEvent } from '../socket/index.js';
import { buildFailureSummary } from '../utils/failureSummary.js';

function now() {
  return new Date();
}

function resolveSchedule(payload) {
  if (payload.type === 'IMMEDIATE' || payload.type === 'BATCH') return { status: 'QUEUED', runAt: now() };
  if (payload.type === 'DELAYED') {
    if (!payload.delaySeconds) throw badRequest('Delayed jobs require delaySeconds');
    return { status: 'SCHEDULED', runAt: new Date(Date.now() + payload.delaySeconds * 1000) };
  }
  if (payload.type === 'SCHEDULED') {
    if (!payload.runAt) throw badRequest('Scheduled jobs require runAt');
    return { status: payload.runAt <= now() ? 'QUEUED' : 'SCHEDULED', runAt: payload.runAt };
  }
  if (payload.type === 'CRON') {
    if (!payload.cronExpression) throw badRequest('Cron jobs require cronExpression');
    if (!payload.runAt) throw badRequest('Cron jobs require the first runAt in this implementation');
    return { status: 'SCHEDULED', runAt: payload.runAt };
  }
  throw badRequest('Unsupported job type');
}

export async function listJobs(user, query) {
  const options = buildListOptions(query, ['name', 'batchId', 'idempotencyKey'], ['createdAt', 'priority', 'runAt', 'status']);
  applyExactFilters(options.where, query, ['queueId', 'status', 'type', 'batchId']);
  if (query.queueId) await assertQueueAccess(user, query.queueId);
  const result = await models.Job.findAndCountAll({
    ...options,
    include: [{ model: models.JobQueue, as: 'queue' }, { model: models.Worker, as: 'lockedByWorker' }],
    distinct: true
  });
  return paginatedResponse(result, options);
}

export async function createJob(user, payload) {
  const queue = await assertQueueAccess(user, payload.queueId, true, true);
  const retryPolicy = queue.retryPolicyId ? await models.RetryPolicy.findByPk(queue.retryPolicyId) : null;
  const schedule = resolveSchedule(payload);
  const job = await sequelize.transaction(async (transaction) => {
    const created = await models.Job.create({
      queueId: payload.queueId,
      type: payload.type,
      status: schedule.status,
      name: payload.name,
      payload: payload.payload,
      priority: payload.priority,
      idempotencyKey: payload.idempotencyKey,
      maxAttempts: payload.maxAttempts || retryPolicy?.maxAttempts || 3,
      runAt: schedule.runAt,
      executionTimeoutSeconds: payload.executionTimeoutSeconds
    }, { transaction });

    if (payload.type === 'CRON') {
      await models.ScheduledJob.create({
        queueId: payload.queueId,
        templateJobId: created.id,
        cronExpression: payload.cronExpression,
        timezone: payload.timezone,
        nextRunAt: schedule.runAt,
        active: true
      }, { transaction });
    }

    await models.JobLog.create({ jobId: created.id, level: 'INFO', message: `Job created with status ${schedule.status}` }, { transaction });
    return created;
  });
  emitSystemEvent('job:created', { jobId: job.id, queueId: job.queueId, status: job.status });
  return job;
}

export async function createBatchJobs(user, payload) {
  await assertQueueAccess(user, payload.queueId, true, true);
  const batchId = payload.batchId || crypto.randomUUID();
  const jobs = await sequelize.transaction(async (transaction) => {
    const rows = await models.Job.bulkCreate(payload.jobs.map((job) => ({
      queueId: payload.queueId,
      batchId,
      idempotencyKey: job.idempotencyKey,
      type: 'BATCH',
      status: 'QUEUED',
      name: job.name,
      payload: job.payload,
      priority: job.priority,
      maxAttempts: 3,
      runAt: now()
    })), { transaction });
    await models.JobLog.bulkCreate(rows.map((job) => ({ jobId: job.id, level: 'INFO', message: `Batch job ${batchId} created` })), { transaction });
    return rows;
  });
  emitSystemEvent('job:batch-created', { batchId, queueId: payload.queueId, count: jobs.length });
  return { batchId, jobs };
}

export async function getJob(user, id) {
  const job = await models.Job.findByPk(id, {
    include: [
      { model: models.JobQueue, as: 'queue' },
      { model: models.JobExecution, as: 'executions' },
      { model: models.RetryHistory, as: 'retryHistory' },
      { model: models.JobLog, as: 'logs' },
      { model: models.DeadLetterJob, as: 'deadLetter' }
    ]
  });
  if (!job) throw notFound('Job');
  await assertQueueAccess(user, job.queueId);
  return job;
}

export async function updateJob(user, id, payload) {
  const job = await models.Job.findByPk(id);
  if (!job) throw notFound('Job');
  await assertQueueAccess(user, job.queueId, true, true);
  if (!['QUEUED', 'SCHEDULED', 'RETRY_PENDING'].includes(job.status)) throw badRequest('Only pending jobs can be updated');
  await job.update(payload);
  return job;
}

export async function cancelJob(user, id) {
  const job = await models.Job.findByPk(id);
  if (!job) throw notFound('Job');
  await assertQueueAccess(user, job.queueId, true, true);
  if (['COMPLETED', 'DEAD_LETTER'].includes(job.status)) throw badRequest('Completed or dead-letter jobs cannot be cancelled');
  await job.update({ status: 'CANCELLED' });
  await models.JobLog.create({ jobId: job.id, level: 'WARN', message: 'Job cancelled' });
  emitSystemEvent('job:cancelled', { jobId: job.id });
  return job;
}

export async function deleteJob(user, id) {
  const job = await models.Job.findByPk(id);
  if (!job) throw notFound('Job');
  await assertQueueAccess(user, job.queueId, true, true);
  if (['CLAIMED', 'RUNNING'].includes(job.status)) throw badRequest('Running jobs cannot be deleted');
  await job.destroy();
  return { deleted: true };
}

export async function activateDueScheduledJobs(limit = 500) {
  const [count] = await models.Job.update(
    { status: 'QUEUED' },
    { where: { status: { [Op.in]: ['SCHEDULED', 'RETRY_PENDING'] }, runAt: { [Op.lte]: now() } }, limit }
  );
  if (count > 0) emitSystemEvent('jobs:activated', { count });
  return count;
}

export function shouldReleaseChildJob(parentStatus, dependencyType) {
  if (dependencyType === 'SUCCESS') return parentStatus === 'COMPLETED';
  return ['COMPLETED', 'FAILED', 'DEAD_LETTER', 'CANCELLED'].includes(parentStatus);
}

async function releaseDependentJobs(parentJob, parentStatus, transaction) {
  const dependencies = await models.WorkflowDependency.findAll({
    where: { parentJobId: parentJob.id },
    include: [{ model: models.Job, as: 'childJob' }],
    transaction
  });

  for (const dependency of dependencies) {
    const childJob = dependency.childJob;
    if (!childJob || !shouldReleaseChildJob(parentStatus, dependency.dependencyType)) continue;
    if (!['QUEUED', 'SCHEDULED', 'RETRY_PENDING'].includes(childJob.status)) continue;
    await childJob.update({ status: 'QUEUED', runAt: now() }, { transaction });
    await models.JobLog.create({ jobId: childJob.id, level: 'INFO', message: `Child job released after parent ${parentJob.id} transitioned to ${parentStatus}` }, { transaction });
  }
}

export async function transitionJob(id, status, payload = {}, transaction = undefined) {
  const job = await models.Job.findByPk(id, { transaction, lock: transaction?.LOCK.UPDATE });
  if (!job) throw notFound('Job');

  if (status === 'RUNNING') {
    await job.update({ status: 'RUNNING', startedAt: now() }, { transaction });
    await models.JobExecution.update({ status: 'RUNNING', startedAt: now() }, { where: { jobId: id, attemptNumber: job.attempts }, transaction });
  } else if (status === 'COMPLETED') {
    const finishedAt = now();
    const durationMs = job.startedAt ? finishedAt - job.startedAt : null;
    await job.update({ status: 'COMPLETED', completedAt: finishedAt, lockedByWorkerId: null }, { transaction });
    await models.JobExecution.update({ status: 'COMPLETED', finishedAt, durationMs, result: payload.result }, { where: { jobId: id, attemptNumber: job.attempts }, transaction });
    await releaseDependentJobs(job, 'COMPLETED', transaction);
  } else if (status === 'FAILED') {
    await failJob(job, payload.errorMessage || 'Job failed', payload.stackTrace, transaction);
    await releaseDependentJobs(job, 'FAILED', transaction);
  } else {
    throw badRequest('Unsupported transition');
  }

  await models.JobLog.create({ jobId: id, level: status === 'FAILED' ? 'ERROR' : 'INFO', message: `Job transitioned to ${status}`, metadata: payload }, { transaction });
  emitSystemEvent('job:transitioned', { jobId: id, status });
  return models.Job.findByPk(id, { transaction });
}

export async function failJob(job, errorMessage, stackTrace, transaction = undefined) {
  const queue = await models.JobQueue.findByPk(job.queueId, { include: [{ model: models.RetryPolicy, as: 'retryPolicy' }], transaction });
  const policy = queue.retryPolicy || { strategy: 'FIXED', maxAttempts: job.maxAttempts, baseDelaySeconds: 30, maxDelaySeconds: 3600, jitterEnabled: true };
  const failedAt = now();
  const durationMs = job.startedAt ? failedAt - job.startedAt : null;

  await models.JobExecution.update({ status: 'FAILED', finishedAt: failedAt, durationMs, errorMessage }, { where: { jobId: job.id, attemptNumber: job.attempts }, transaction });

  if (job.attempts < Math.min(job.maxAttempts, policy.maxAttempts)) {
    const delaySeconds = calculateRetryDelay(policy, job.attempts);
    const nextRetryAt = new Date(Date.now() + delaySeconds * 1000);
    await models.RetryHistory.create({ jobId: job.id, attemptNumber: job.attempts, strategy: policy.strategy, delaySeconds, scheduledAt: nextRetryAt, errorMessage }, { transaction });
    await job.update({ status: 'RETRY_PENDING', failedAt, nextRetryAt, runAt: nextRetryAt, lastError: errorMessage, lockedByWorkerId: null }, { transaction });
    return job;
  }

  const queueName = queue?.name || 'queue';
  const aiSummary = buildFailureSummary({ queueName, jobName: job.name, errorMessage, attempts: job.attempts });

  await job.update({ status: 'DEAD_LETTER', failedAt, lastError: errorMessage, lockedByWorkerId: null }, { transaction });
  await models.DeadLetterJob.findOrCreate({
    where: { jobId: job.id },
    defaults: { queueId: job.queueId, failureReason: errorMessage, stackTrace, payloadSnapshot: job.payload, attempts: job.attempts, failedAt, aiSummary },
    transaction
  });
  emitSystemEvent('job:dead-lettered', { jobId: job.id, queueId: job.queueId });
  return job;
}
