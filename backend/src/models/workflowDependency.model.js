export function defineWorkflowDependency(sequelize, DataTypes) {
  const WorkflowDependency = sequelize.define('WorkflowDependency', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    parentJobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'parent_job_id' },
    childJobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'child_job_id' },
    dependencyType: { type: DataTypes.ENUM('SUCCESS', 'COMPLETION'), allowNull: false, defaultValue: 'SUCCESS', field: 'dependency_type' }
  }, { tableName: 'workflow_dependencies', updatedAt: false });

  WorkflowDependency.associate = (models) => {
    WorkflowDependency.belongsTo(models.Job, { as: 'parentJob', foreignKey: 'parent_job_id' });
    WorkflowDependency.belongsTo(models.Job, { as: 'childJob', foreignKey: 'child_job_id' });
  };

  return WorkflowDependency;
}
