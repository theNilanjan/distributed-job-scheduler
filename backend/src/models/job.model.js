export function defineJob(sequelize, DataTypes) {
  const Job = sequelize.define('Job', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    queueId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'queue_id' },
    batchId: { type: DataTypes.STRING(80), field: 'batch_id' },
    idempotencyKey: { type: DataTypes.STRING(160), field: 'idempotency_key' },
    type: { type: DataTypes.ENUM('IMMEDIATE', 'DELAYED', 'SCHEDULED', 'CRON', 'BATCH'), allowNull: false },
    status: { type: DataTypes.ENUM('QUEUED', 'SCHEDULED', 'CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRY_PENDING', 'DEAD_LETTER', 'CANCELLED'), allowNull: false },
    name: { type: DataTypes.STRING(180), allowNull: false },
    payload: { type: DataTypes.JSON, allowNull: false },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    maxAttempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3, field: 'max_attempts' },
    runAt: { type: DataTypes.DATE, allowNull: false, field: 'run_at' },
    claimedAt: { type: DataTypes.DATE, field: 'claimed_at' },
    startedAt: { type: DataTypes.DATE, field: 'started_at' },
    completedAt: { type: DataTypes.DATE, field: 'completed_at' },
    failedAt: { type: DataTypes.DATE, field: 'failed_at' },
    nextRetryAt: { type: DataTypes.DATE, field: 'next_retry_at' },
    lockedByWorkerId: { type: DataTypes.BIGINT.UNSIGNED, field: 'locked_by_worker_id' },
    lastError: { type: DataTypes.TEXT, field: 'last_error' },
    executionTimeoutSeconds: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 300, field: 'execution_timeout_seconds' }
  }, { tableName: 'jobs' });

  Job.associate = (models) => {
    Job.belongsTo(models.JobQueue, { as: 'queue', foreignKey: 'queue_id' });
    Job.belongsTo(models.Worker, { as: 'lockedByWorker', foreignKey: 'locked_by_worker_id' });
    Job.hasMany(models.JobExecution, { as: 'executions', foreignKey: 'job_id' });
    Job.hasMany(models.RetryHistory, { as: 'retryHistory', foreignKey: 'job_id' });
    Job.hasMany(models.JobLog, { as: 'logs', foreignKey: 'job_id' });
    Job.hasOne(models.DeadLetterJob, { as: 'deadLetter', foreignKey: 'job_id' });
  };

  return Job;
}
