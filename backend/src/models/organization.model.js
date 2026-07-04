export function defineOrganization(sequelize, DataTypes) {
  const Organization = sequelize.define('Organization', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(140), allowNull: false },
    slug: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT }
  }, { tableName: 'organizations' });

  Organization.associate = (models) => {
    Organization.hasMany(models.OrganizationMember, { as: 'memberships', foreignKey: 'organization_id' });
    Organization.hasMany(models.Project, { as: 'projects', foreignKey: 'organization_id' });
  };

  return Organization;
}
