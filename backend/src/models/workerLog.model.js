export function defineWorkerLog(sequelize, DataTypes) {
  const WorkerLog = sequelize.define('WorkerLog', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    workerId: { type: DataTypes.BIGINT.UNSIGNED, field: 'worker_id' },
    level: { type: DataTypes.ENUM('DEBUG', 'INFO', 'WARN', 'ERROR'), allowNull: false, defaultValue: 'INFO' },
    message: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSON }
  }, { tableName: 'worker_logs', updatedAt: false });

  WorkerLog.associate = (models) => {
    WorkerLog.belongsTo(models.Worker, { as: 'worker', foreignKey: 'worker_id' });
  };

  return WorkerLog;
}
