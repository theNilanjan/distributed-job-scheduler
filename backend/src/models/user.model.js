export function defineUser(sequelize, DataTypes) {
  const User = sequelize.define('User', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(190), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    status: { type: DataTypes.ENUM('ACTIVE', 'INVITED', 'SUSPENDED'), allowNull: false, defaultValue: 'ACTIVE' },
    lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' }
  }, { tableName: 'users' });

  User.associate = (models) => {
    User.hasMany(models.UserRole, { as: 'userRoles', foreignKey: 'user_id' });
    User.hasMany(models.RefreshToken, { as: 'refreshTokens', foreignKey: 'user_id' });
    User.hasMany(models.OrganizationMember, { as: 'organizationMemberships', foreignKey: 'user_id' });
    User.hasMany(models.ProjectMember, { as: 'projectMemberships', foreignKey: 'user_id' });
  };

  return User;
}
