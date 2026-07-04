export function defineProjectMember(sequelize, DataTypes) {
  const ProjectMember = sequelize.define('ProjectMember', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'project_id' },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    role: { type: DataTypes.ENUM('PROJECT_ADMIN', 'DEVELOPER', 'VIEWER'), allowNull: false, defaultValue: 'DEVELOPER' }
  }, { tableName: 'project_members' });

  ProjectMember.associate = (models) => {
    ProjectMember.belongsTo(models.Project, { as: 'project', foreignKey: 'project_id' });
    ProjectMember.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
  };

  return ProjectMember;
}
