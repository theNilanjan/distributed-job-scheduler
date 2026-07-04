export function defineRetryHistory(sequelize, DataTypes) {
  const RetryHistory = sequelize.define('RetryHistory', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'job_id' },
    attemptNumber: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'attempt_number' },
    strategy: { type: DataTypes.ENUM('FIXED', 'LINEAR', 'EXPONENTIAL'), allowNull: false },
    delaySeconds: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'delay_seconds' },
    scheduledAt: { type: DataTypes.DATE, allowNull: false, field: 'scheduled_at' },
    errorMessage: { type: DataTypes.TEXT, field: 'error_message' }
  }, { tableName: 'retry_history', updatedAt: false });

  RetryHistory.associate = (models) => {
    RetryHistory.belongsTo(models.Job, { as: 'job', foreignKey: 'job_id' });
  };

  return RetryHistory;
}
