export function defineProject(sequelize, DataTypes) {
  const Project = sequelize.define('Project', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    organizationId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'organization_id' },
    name: { type: DataTypes.STRING(140), allowNull: false },
    key: { type: DataTypes.STRING(40), allowNull: false },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'), allowNull: false, defaultValue: 'ACTIVE' }
  }, { tableName: 'projects' });

  Project.associate = (models) => {
    Project.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Project.hasMany(models.ProjectMember, { as: 'memberships', foreignKey: 'project_id' });
    Project.hasMany(models.JobQueue, { as: 'queues', foreignKey: 'project_id' });
  };

  return Project;
}
