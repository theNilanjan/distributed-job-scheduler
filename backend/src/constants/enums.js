export const UserStatus = Object.freeze({ ACTIVE: 'ACTIVE', INVITED: 'INVITED', SUSPENDED: 'SUSPENDED' });
export const QueueStatus = Object.freeze({ ACTIVE: 'ACTIVE', PAUSED: 'PAUSED', ARCHIVED: 'ARCHIVED' });
export const JobStatus = Object.freeze({
  QUEUED: 'QUEUED',
  SCHEDULED: 'SCHEDULED',
  CLAIMED: 'CLAIMED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RETRY_PENDING: 'RETRY_PENDING',
  DEAD_LETTER: 'DEAD_LETTER',
  CANCELLED: 'CANCELLED'
});
export const JobType = Object.freeze({ IMMEDIATE: 'IMMEDIATE', DELAYED: 'DELAYED', SCHEDULED: 'SCHEDULED', CRON: 'CRON', BATCH: 'BATCH' });
export const RetryStrategy = Object.freeze({ FIXED: 'FIXED', LINEAR: 'LINEAR', EXPONENTIAL: 'EXPONENTIAL' });
export const WorkerStatus = Object.freeze({ ONLINE: 'ONLINE', DRAINING: 'DRAINING', OFFLINE: 'OFFLINE', STALE: 'STALE' });
