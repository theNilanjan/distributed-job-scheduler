export function defineUserRole(sequelize, DataTypes) {
  const UserRole = sequelize.define('UserRole', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    roleId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'role_id' }
  }, { 
    tableName: 'user_roles',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['user_id', 'role_id'], name: 'ux_user_roles_user_role' },
      { fields: ['role_id'], name: 'role_id' }
    ]
  });

  UserRole.associate = (models) => {
    UserRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UserRole.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
  };

  return UserRole;
}
