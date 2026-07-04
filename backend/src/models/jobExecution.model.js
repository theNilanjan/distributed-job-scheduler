export function defineJobExecution(sequelize, DataTypes) {
  const JobExecution = sequelize.define('JobExecution', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'job_id' },
    workerId: { type: DataTypes.BIGINT.UNSIGNED, field: 'worker_id' },
    attemptNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'attempt_number' },
    status: { type: DataTypes.ENUM('CLAIMED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'), allowNull: false },
    startedAt: { type: DataTypes.DATE, field: 'started_at' },
    finishedAt: { type: DataTypes.DATE, field: 'finished_at' },
    durationMs: { type: DataTypes.INTEGER.UNSIGNED, field: 'duration_ms' },
    result: { type: DataTypes.JSON },
    errorMessage: { type: DataTypes.TEXT, field: 'error_message' }
  }, { tableName: 'job_executions' });

  JobExecution.associate = (models) => {
    JobExecution.belongsTo(models.Job, { as: 'job', foreignKey: 'job_id' });
    JobExecution.belongsTo(models.Worker, { as: 'worker', foreignKey: 'worker_id' });
  };

  return JobExecution;
}
