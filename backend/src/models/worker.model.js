export function defineWorker(sequelize, DataTypes) {
  const Worker = sequelize.define('Worker', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(140), allowNull: false },
    hostname: { type: DataTypes.STRING(190), allowNull: false },
    status: { type: DataTypes.ENUM('ONLINE', 'DRAINING', 'OFFLINE', 'STALE'), allowNull: false, defaultValue: 'ONLINE' },
    maxConcurrency: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 5, field: 'max_concurrency' },
    currentLoad: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'current_load' },
    lastHeartbeatAt: { type: DataTypes.DATE, field: 'last_heartbeat_at' },
    startedAt: { type: DataTypes.DATE, allowNull: false, field: 'started_at' },
    stoppedAt: { type: DataTypes.DATE, field: 'stopped_at' }
  }, { tableName: 'workers' });

  Worker.associate = (models) => {
    Worker.hasMany(models.WorkerHeartbeat, { as: 'heartbeats', foreignKey: 'worker_id' });
    Worker.hasMany(models.WorkerLog, { as: 'logs', foreignKey: 'worker_id' });
    Worker.hasMany(models.JobExecution, { as: 'executions', foreignKey: 'worker_id' });
  };

  return Worker;
}
