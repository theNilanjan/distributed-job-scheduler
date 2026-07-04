export function defineDeadLetterJob(sequelize, DataTypes) {
  const DeadLetterJob = sequelize.define('DeadLetterJob', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true, field: 'job_id' },
    queueId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'queue_id' },
    failureReason: { type: DataTypes.TEXT, allowNull: false, field: 'failure_reason' },
    stackTrace: { type: DataTypes.TEXT('long'), field: 'stack_trace' },
    payloadSnapshot: { type: DataTypes.JSON, allowNull: false, field: 'payload_snapshot' },
    attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    failedAt: { type: DataTypes.DATE, allowNull: false, field: 'failed_at' },
    replayedAt: { type: DataTypes.DATE, field: 'replayed_at' },
    aiSummary: { type: DataTypes.TEXT, field: 'ai_summary' }
  }, { tableName: 'dead_letter_jobs' });

  DeadLetterJob.associate = (models) => {
    DeadLetterJob.belongsTo(models.Job, { as: 'job', foreignKey: 'job_id' });
    DeadLetterJob.belongsTo(models.JobQueue, { as: 'queue', foreignKey: 'queue_id' });
  };

  return DeadLetterJob;
}
