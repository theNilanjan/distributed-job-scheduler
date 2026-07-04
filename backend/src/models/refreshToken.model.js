export function defineRefreshToken(sequelize, DataTypes) {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    tokenHash: { type: DataTypes.STRING(255), allowNull: false, unique: true, field: 'token_hash' },
    expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
    replacedByTokenHash: { type: DataTypes.STRING(255), field: 'replaced_by_token_hash' },
    ipAddress: { type: DataTypes.STRING(64), field: 'ip_address' },
    userAgent: { type: DataTypes.STRING(512), field: 'user_agent' }
  }, { tableName: 'refresh_tokens' });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
  };

  return RefreshToken;
}
