export function defineDistributedLock(sequelize, DataTypes) {
  return sequelize.define('DistributedLock', {
    name: { type: DataTypes.STRING(120), primaryKey: true },
    owner: { type: DataTypes.STRING(190), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    metadata: { type: DataTypes.JSON }
  }, { tableName: 'distributed_locks' });
}
