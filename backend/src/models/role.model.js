export function defineRole(sequelize, DataTypes) {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) }
  }, { tableName: 'roles', timestamps: false });

  Role.associate = (models) => {
    Role.belongsToMany(models.User, { through: 'user_roles', as: 'users', foreignKey: 'role_id', otherKey: 'user_id', timestamps: false });
  };

  return Role;
}
