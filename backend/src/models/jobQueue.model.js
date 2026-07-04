export function defineJobQueue(sequelize, DataTypes) {
  const JobQueue = sequelize.define('JobQueue', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'project_id' },
    retryPolicyId: { type: DataTypes.BIGINT.UNSIGNED, field: 'retry_policy_id' },
    name: { type: DataTypes.STRING(140), allowNull: false },
    slug: { type: DataTypes.STRING(160), allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'PAUSED', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    concurrencyLimit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 5, field: 'concurrency_limit' },
    rateLimitPerMinute: { type: DataTypes.INTEGER.UNSIGNED, field: 'rate_limit_per_minute' },
    shardKey: { type: DataTypes.STRING(80), field: 'shard_key' }
  }, { tableName: 'job_queues' });

  JobQueue.associate = (models) => {
    JobQueue.belongsTo(models.Project, { as: 'project', foreignKey: 'project_id' });
    JobQueue.belongsTo(models.RetryPolicy, { as: 'retryPolicy', foreignKey: 'retry_policy_id' });
    JobQueue.hasMany(models.Job, { as: 'jobs', foreignKey: 'queue_id' });
  };

  return JobQueue;
}
