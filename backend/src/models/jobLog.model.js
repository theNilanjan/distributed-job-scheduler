export function defineJobLog(sequelize, DataTypes) {
  const JobLog = sequelize.define('JobLog', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'job_id' },
    executionId: { type: DataTypes.BIGINT.UNSIGNED, field: 'execution_id' },
    level: { type: DataTypes.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR'), allowNull: false, defaultValue: 'INFO' },
    message: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSON }
  }, { tableName: 'job_logs', updatedAt: false });

  JobLog.associate = (models) => {
    JobLog.belongsTo(models.Job, { as: 'job', foreignKey: 'job_id' });
    JobLog.belongsTo(models.JobExecution, { as: 'execution', foreignKey: 'execution_id' });
  };

  return JobLog;
}
