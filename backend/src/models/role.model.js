export function defineRole(sequelize, DataTypes) {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) }
  }, { tableName: 'roles', timestamps: false });

  Role.associate = (models) => {
    Role.hasMany(models.UserRole, { as: 'userRoles', foreignKey: 'role_id' });
  };

  return Role;
}
