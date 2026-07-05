import { Op } from 'sequelize';
import { models, sequelize } from '../models/index.js';

async function getJobCountsByStatus() {
  const statuses = ['QUEUED', 'SCHEDULED', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'DEAD_LETTER', 'CANCELLED'];
  const counts = await models.Job.findAll({
    attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['status']
  });

  const result = statuses.reduce((acc, status) => {
    acc[status.toLowerCase()] = 0;
    return acc;
  }, {});

  counts.forEach((item) => {
    const status = item.get('status');
    if (status) {
      result[status.toLowerCase()] = Number(item.get('count'));
    }
  });

  return result;
}

async function getWorkerMetrics() {
  const total = await models.Worker.count();
  const online = await models.Worker.count({ where: { status: { [Op.in]: ['ONLINE', 'DRAINING'] } } });
  const stale = await models.Worker.count({ where: { status: 'STALE' } });
  const load = await models.Worker.findAll({ where: { status: { [Op.in]: ['ONLINE', 'DRAINING'] } } });
  const currentLoad = load.reduce((sum, worker) => sum + worker.currentLoad, 0);
  const maxConcurrency = load.reduce((sum, worker) => sum + worker.maxConcurrency, 0);
  return { total, online, stale, currentLoad, maxConcurrency };
}

async function getReliabilityMetrics() {
  const deadLetterCount = await models.DeadLetterJob.count();
  const retries = await models.RetryHistory.count();
  const totalJobs = await models.Job.count();
  const completedJobs = await models.Job.count({ where: { status: 'COMPLETED' } });
  const successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100;
  
  const executions = await models.JobExecution.findAll({
    where: { status: 'COMPLETED' },
    attributes: [[sequelize.fn('AVG', sequelize.col('duration_ms')), 'averageDurationMs']]
  });
  const averageExecutionTime = executions[0]?.get('averageDurationMs') ? Math.round(executions[0].get('averageDurationMs')) : 0;
  
  const retryPolicies = await models.RetryPolicy.count();
  
  return { deadLetterJobs: deadLetterCount, totalRetries: retries, successRate, averageExecutionTime, retryPolicies };
}

async function getQueueRows() {
  const queues = await models.JobQueue.findAll({
    where: { status: 'ACTIVE' },
    attributes: ['id', 'name', 'priority', 'concurrencyLimit']
  });
  return queues.map(q => ({
    name: q.name,
    priority: q.priority,
    concurrencyLimit: q.concurrencyLimit
  }));
}

async function getWorkerRows() {
  const workers = await models.Worker.findAll({
    where: { status: { [Op.in]: ['ONLINE', 'DRAINING'] } },
    attributes: ['name', 'currentLoad', 'maxConcurrency']
  });
  return workers.map(w => ({
    name: w.name,
    currentLoad: w.currentLoad,
    maxConcurrency: w.maxConcurrency
  }));
}

/**
 * Fetches a comprehensive summary of system-wide metrics.
 * This includes counts for all major entities, job status distributions,
 * worker utilization, and reliability metrics.
 * @returns {Promise<object>} A promise that resolves to the summary data.
 */
export async function getDashboardSummary() {
  const [jobCounts, workerMetrics, reliabilityMetrics, queueCount, projectCount, queueRows, workerRows] = await Promise.all([
    getJobCountsByStatus(),
    getWorkerMetrics(),
    getReliabilityMetrics(),
    models.JobQueue.count(),
    models.Project.count(),
    getQueueRows(),
    getWorkerRows()
  ]);

  return { 
    jobCounts, 
    jobsByStatus: jobCounts,
    workerMetrics, 
    reliabilityMetrics, 
    queueCount, 
    projectCount,
    queueRows,
    workerRows,
    successRate: reliabilityMetrics.successRate,
    averageExecutionTime: reliabilityMetrics.averageExecutionTime,
    retryPolicies: reliabilityMetrics.retryPolicies
  };
}
