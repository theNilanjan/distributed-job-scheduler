import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { defineUser } from './user.model.js';
import { defineRole } from './role.model.js';
import { defineOrganization } from './organization.model.js';
import { defineOrganizationMember } from './organizationMember.model.js';
import { defineProject } from './project.model.js';
import { defineProjectMember } from './projectMember.model.js';
import { defineRetryPolicy } from './retryPolicy.model.js';
import { defineJobQueue } from './jobQueue.model.js';
import { defineJob } from './job.model.js';
import { defineScheduledJob } from './scheduledJob.model.js';
import { defineJobExecution } from './jobExecution.model.js';
import { defineRetryHistory } from './retryHistory.model.js';
import { defineWorker } from './worker.model.js';
import { defineWorkerHeartbeat } from './workerHeartbeat.model.js';
import { defineWorkerLog } from './workerLog.model.js';
import { defineJobLog } from './jobLog.model.js';
import { defineDeadLetterJob } from './deadLetterJob.model.js';
import { defineWorkflowDependency } from './workflowDependency.model.js';
import { defineDistributedLock } from './distributedLock.model.js';
import { defineRefreshToken } from './refreshToken.model.js';

export const models = {
  User: defineUser(sequelize, DataTypes),
  Role: defineRole(sequelize, DataTypes),
  RefreshToken: defineRefreshToken(sequelize, DataTypes),
  Organization: defineOrganization(sequelize, DataTypes),
  OrganizationMember: defineOrganizationMember(sequelize, DataTypes),
  Project: defineProject(sequelize, DataTypes),
  ProjectMember: defineProjectMember(sequelize, DataTypes),
  RetryPolicy: defineRetryPolicy(sequelize, DataTypes),
  JobQueue: defineJobQueue(sequelize, DataTypes),
  Job: defineJob(sequelize, DataTypes),
  ScheduledJob: defineScheduledJob(sequelize, DataTypes),
  JobExecution: defineJobExecution(sequelize, DataTypes),
  RetryHistory: defineRetryHistory(sequelize, DataTypes),
  Worker: defineWorker(sequelize, DataTypes),
  WorkerHeartbeat: defineWorkerHeartbeat(sequelize, DataTypes),
  WorkerLog: defineWorkerLog(sequelize, DataTypes),
  JobLog: defineJobLog(sequelize, DataTypes),
  DeadLetterJob: defineDeadLetterJob(sequelize, DataTypes),
  WorkflowDependency: defineWorkflowDependency(sequelize, DataTypes),
  DistributedLock: defineDistributedLock(sequelize, DataTypes)
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

export { sequelize };
