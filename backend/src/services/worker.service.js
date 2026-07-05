import os from 'os';
import { Op, QueryTypes } from 'sequelize';
import { env } from '../config/env.js';
import { models, sequelize } from '../models/index.js';
import { activateDueScheduledJobs, transitionJob } from './job.service.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';
import { emitSystemEvent } from '../socket/index.js';
import { logger } from '../utils/logger.js';

export async function listWorkers(user, query) {
  const options = buildListOptions(query, ['name', 'hostname'], ['createdAt', 'name', 'lastHeartbeatAt']);
  applyExactFilters(options.where, query, ['status']);
  return paginatedResponse(await models.Worker.findAndCountAll(options), options);
}

export async function registerWorker(payload) {
  const worker = await models.Worker.create({
    name: payload.name,
    hostname: payload.hostname || os.hostname(),
    status: 'ONLINE',
    maxConcurrency: payload.maxConcurrency,
    currentLoad: 0,
    lastHeartbeatAt: new Date(),
    startedAt: new Date()
  });
  await models.WorkerLog.create({ workerId: worker.id, level: 'INFO', message: 'Worker registered' });
  emitSystemEvent('worker:registered', { workerId: worker.id });
  return worker;
}

export async function heartbeat(workerId, payload) {
  const worker = await models.Worker.findByPk(workerId);
  if (!worker) throw notFound('Worker');
  await worker.update({ status: worker.status === 'DRAINING' ? 'DRAINING' : 'ONLINE', currentLoad: payload.activeJobs, lastHeartbeatAt: new Date() });
  await models.WorkerHeartbeat.create({ workerId, activeJobs: payload.activeJobs, capacity: payload.capacity, metadata: payload.metadata });
  emitSystemEvent('worker:heartbeat', { workerId, activeJobs: payload.activeJobs });
  return worker;
}

export async function drainWorker(workerId) {
  const worker = await models.Worker.findByPk(workerId);
  if (!worker) throw notFound('Worker');
  await worker.update({ status: 'DRAINING' });
  await models.WorkerLog.create({ workerId, level: 'WARN', message: 'Worker entered draining mode' });
  return worker;
}

export async function stopWorker(workerId) {
  const worker = await models.Worker.findByPk(workerId);
  if (!worker) throw notFound('Worker');
  await worker.update({ status: 'OFFLINE', stoppedAt: new Date(), currentLoad: 0 });
  await models.WorkerLog.create({ workerId, level: 'INFO', message: 'Worker stopped' });
  return worker;
}

async function activeQueueIds(queueId) {
  if (queueId) return [queueId];
  const queues = await models.JobQueue.findAll({
    where: { status: 'ACTIVE' },
    order: [['priority', 'DESC'], ['createdAt', 'ASC']],
    attributes: ['id']
  });
  return queues.map((queue) => queue.id);
}

export async function claimJobs({ workerId, queueId, limit }) {
  await activateDueScheduledJobs();
  const worker = await models.Worker.findByPk(workerId);
  if (!worker) throw notFound('Worker');
  if (!['ONLINE', 'DRAINING'].includes(worker.status)) throw badRequest('Worker is not available for claiming');
  if (worker.status === 'DRAINING') return [];

  const claimed = [];
  const queues = await activeQueueIds(queueId);

  for (const currentQueueId of queues) {
    if (claimed.length >= limit) break;
    const remaining = Math.min(limit - claimed.length, Math.max(worker.maxConcurrency - worker.currentLoad - claimed.length, 0));
    if (remaining <= 0) break;

    const queueClaimed = await sequelize.transaction(async (transaction) => {
      // Locking the queue row serializes capacity checks per queue. Job rows are then
      // selected with FOR UPDATE SKIP LOCKED so competing workers never receive the same job.
      const [queue] = await sequelize.query(
        'SELECT * FROM job_queues WHERE id = :queueId AND status = "ACTIVE" FOR UPDATE',
        { replacements: { queueId: currentQueueId }, transaction, type: QueryTypes.SELECT }
      );
      if (!queue) return [];

      const activeCount = await models.Job.count({
        where: { queueId: currentQueueId, status: { [Op.in]: ['CLAIMED', 'RUNNING'] } },
        transaction
      });
      const available = Math.min(Number(queue.concurrency_limit) - activeCount, remaining);
      if (available <= 0) return [];

      const rows = await sequelize.query(
        `SELECT id
         FROM jobs
         WHERE queue_id = :queueId
           AND status IN ('QUEUED', 'RETRY_PENDING')
           AND run_at <= UTC_TIMESTAMP()
         ORDER BY priority DESC, created_at ASC
         LIMIT :available
         FOR UPDATE SKIP LOCKED`,
        { replacements: { queueId: currentQueueId, available }, transaction, type: QueryTypes.SELECT }
      );
      const ids = rows.map((row) => row.id);
      if (!ids.length) return [];

      const claimTime = new Date();
      await models.Job.update(
        { status: 'CLAIMED', lockedByWorkerId: workerId, claimedAt: claimTime, attempts: sequelize.literal('attempts + 1') },
        { where: { id: ids }, transaction }
      );

      const updatedJobs = await models.Job.findAll({ where: { id: ids }, transaction });
      await models.JobExecution.bulkCreate(updatedJobs.map((job) => ({
        jobId: job.id,
        workerId,
        attemptNumber: job.attempts,
        status: 'CLAIMED'
      })), { transaction });
      await models.JobLog.bulkCreate(updatedJobs.map((job) => ({ jobId: job.id, level: 'INFO', message: `Claimed by worker ${workerId}` })), { transaction });
      return updatedJobs;
    });

    claimed.push(...queueClaimed);
  }

  if (claimed.length) {
    await worker.increment('currentLoad', { by: claimed.length });
    emitSystemEvent('jobs:claimed', { workerId, jobIds: claimed.map((job) => job.id) });
  }
  return claimed;
}

export async function markJobRunning(jobId, workerId) {
  const job = await models.Job.findByPk(jobId);
  if (!job) throw notFound('Job');
  if (String(job.lockedByWorkerId) !== String(workerId)) throw badRequest('Job is not assigned to this worker');
  return transitionJob(jobId, 'RUNNING');
}

export async function completeJob(jobId, workerId, result) {
  return sequelize.transaction(async (transaction) => {
    const job = await models.Job.findByPk(jobId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!job) throw notFound('Job');
    if (String(job.lockedByWorkerId) !== String(workerId)) throw badRequest('Job is not assigned to this worker');
    const updated = await transitionJob(jobId, 'COMPLETED', { result }, transaction);
    await models.Worker.decrement('currentLoad', { by: 1, where: { id: workerId }, transaction });
    return updated;
  });
}

export async function failClaimedJob(jobId, workerId, payload) {
  return sequelize.transaction(async (transaction) => {
    const job = await models.Job.findByPk(jobId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!job) throw notFound('Job');
    if (String(job.lockedByWorkerId) !== String(workerId)) throw badRequest('Job is not assigned to this worker');
    const updated = await transitionJob(jobId, 'FAILED', payload, transaction);
    await models.Worker.decrement('currentLoad', { by: 1, where: { id: workerId }, transaction });
    return updated;
  });
}

export async function recoverAbandonedJobs() {
  const staleBefore = new Date(Date.now() - env.WORKER_HEARTBEAT_TIMEOUT_SECONDS * 1000);
  const staleWorkers = await models.Worker.findAll({
    where: {
      status: { [Op.in]: ['ONLINE', 'DRAINING'] },
      lastHeartbeatAt: { [Op.lt]: staleBefore }
    }
  });
  const workerIds = staleWorkers.map((worker) => worker.id);
  if (!workerIds.length) return { staleWorkers: 0, recoveredJobs: 0 };

  await models.Worker.update({ status: 'STALE', currentLoad: 0 }, { where: { id: workerIds } });
  const [recoveredJobs] = await models.Job.update(
    { status: 'QUEUED', lockedByWorkerId: null, claimedAt: null, startedAt: null },
    { where: { lockedByWorkerId: workerIds, status: { [Op.in]: ['CLAIMED', 'RUNNING'] } } }
  );
  await models.WorkerLog.bulkCreate(workerIds.map((workerId) => ({ workerId, level: 'ERROR', message: `Worker marked stale; recovered ${recoveredJobs} jobs` })));
  logger.warn('Recovered abandoned worker jobs', { workerIds, recoveredJobs });
  emitSystemEvent('workers:recovered', { workerIds, recoveredJobs });
  return { staleWorkers: workerIds.length, recoveredJobs };
}
