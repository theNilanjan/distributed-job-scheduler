export function defineOrganizationMember(sequelize, DataTypes) {
  const OrganizationMember = sequelize.define('OrganizationMember', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    organizationId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'organization_id' },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    role: { type: DataTypes.ENUM('ORG_ADMIN', 'MEMBER', 'VIEWER'), allowNull: false, defaultValue: 'MEMBER' }
  }, { tableName: 'organization_members' });

  OrganizationMember.associate = (models) => {
    OrganizationMember.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    OrganizationMember.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
  };

  return OrganizationMember;
}
