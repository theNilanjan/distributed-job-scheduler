export function defineScheduledJob(sequelize, DataTypes) {
  const ScheduledJob = sequelize.define('ScheduledJob', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    queueId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'queue_id' },
    templateJobId: { type: DataTypes.BIGINT.UNSIGNED, field: 'template_job_id' },
    cronExpression: { type: DataTypes.STRING(120), field: 'cron_expression' },
    timezone: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'UTC' },
    nextRunAt: { type: DataTypes.DATE, allowNull: false, field: 'next_run_at' },
    lastRunAt: { type: DataTypes.DATE, field: 'last_run_at' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, { tableName: 'scheduled_jobs' });

  ScheduledJob.associate = (models) => {
    ScheduledJob.belongsTo(models.JobQueue, { as: 'queue', foreignKey: 'queue_id' });
    ScheduledJob.belongsTo(models.Job, { as: 'templateJob', foreignKey: 'template_job_id' });
  };

  return ScheduledJob;
}
