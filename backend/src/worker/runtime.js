import os from 'os';
import { logger } from '../utils/logger.js';
import { registerWorker, heartbeat, claimJobs, markJobRunning, completeJob, failClaimedJob, recoverAbandonedJobs } from '../services/worker.service.js';

export class WorkerRuntime {
  constructor({ name = `worker-${os.hostname()}-${process.pid}`, concurrency = 5, pollIntervalMs = 2000 } = {}) {
    this.name = name;
    this.concurrency = concurrency;
    this.pollIntervalMs = pollIntervalMs;
    this.running = false;
    this.active = new Set();
    this.worker = null;
  }

  async start() {
    this.worker = await registerWorker({ name: this.name, hostname: os.hostname(), maxConcurrency: this.concurrency });
    this.running = true;
    this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), 5000);
    this.recoveryTimer = setInterval(() => recoverAbandonedJobs().catch((error) => logger.error('Worker recovery failed', { error: error.message })), 15000);
    this.loop();
  }

  async loop() {
    while (this.running) {
      try {
        const capacity = Math.max(this.concurrency - this.active.size, 0);
        if (capacity > 0) {
          const jobs = await claimJobs({ workerId: this.worker.id, limit: capacity });
          for (const job of jobs) this.execute(job);
        }
      } catch (error) {
        logger.error('Worker poll failed', { error: error.message, stack: error.stack });
      }
      await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
    }
  }

  async execute(job) {
    this.active.add(job.id);
    try {
      await markJobRunning(job.id, this.worker.id);
      // This project executes generic JSON-described jobs. Real deployments would
      // dispatch by job.name/type to registered handlers.
      const result = { processed: true, echo: job.payload };
      await completeJob(job.id, this.worker.id, result);
    } catch (error) {
      await failClaimedJob(job.id, this.worker.id, { errorMessage: error.message, stackTrace: error.stack });
    } finally {
      this.active.delete(job.id);
    }
  }

  async sendHeartbeat() {
    if (!this.worker) return;
    await heartbeat(this.worker.id, { activeJobs: this.active.size, capacity: this.concurrency, metadata: { pid: process.pid } })
      .catch((error) => logger.error('Worker heartbeat failed', { error: error.message }));
  }

  async shutdown() {
    this.running = false;
    clearInterval(this.heartbeatTimer);
    clearInterval(this.recoveryTimer);
    while (this.active.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    await this.sendHeartbeat();
  }
}
