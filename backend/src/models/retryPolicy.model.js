export function defineRetryPolicy(sequelize, DataTypes) {
  const RetryPolicy = sequelize.define('RetryPolicy', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    strategy: { type: DataTypes.ENUM('FIXED', 'LINEAR', 'EXPONENTIAL'), allowNull: false },
    maxAttempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3, field: 'max_attempts' },
    baseDelaySeconds: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 30, field: 'base_delay_seconds' },
    maxDelaySeconds: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3600, field: 'max_delay_seconds' },
    jitterEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'jitter_enabled' }
  }, { tableName: 'retry_policies' });

  RetryPolicy.associate = (models) => {
    RetryPolicy.hasMany(models.JobQueue, { as: 'queues', foreignKey: 'retry_policy_id' });
  };

  return RetryPolicy;
}
