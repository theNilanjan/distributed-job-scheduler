export function defineWorkerHeartbeat(sequelize, DataTypes) {
  const WorkerHeartbeat = sequelize.define('WorkerHeartbeat', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    workerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'worker_id' },
    activeJobs: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'active_jobs' },
    capacity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    metadata: { type: DataTypes.JSON }
  }, { tableName: 'worker_heartbeats', updatedAt: false });

  WorkerHeartbeat.associate = (models) => {
    WorkerHeartbeat.belongsTo(models.Worker, { as: 'worker', foreignKey: 'worker_id' });
  };

  return WorkerHeartbeat;
}
