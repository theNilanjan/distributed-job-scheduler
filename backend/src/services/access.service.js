import { models } from '../models/index.js';
import { forbidden, notFound } from '../utils/httpError.js';

export const platformRoles = ['SUPER_ADMIN'];
export const orgWriteRoles = ['ORG_ADMIN'];
export const projectWriteRoles = ['PROJECT_ADMIN'];
export const jobWriteRoles = ['PROJECT_ADMIN', 'DEVELOPER'];

export function hasPlatformRole(user) {
  return user?.roles?.some((role) => platformRoles.includes(role));
}

export async function assertOrganizationAccess(user, organizationId, write = false) {
  if (hasPlatformRole(user)) return true;
  const membership = await models.OrganizationMember.findOne({ where: { organizationId, userId: user.id } });
  if (!membership) throw forbidden('No access to this organization');
  if (write && !orgWriteRoles.includes(membership.role)) throw forbidden('Organization admin role required');
  return true;
}

export async function assertProjectAccess(user, projectId, write = false, developerAllowed = false) {
  if (hasPlatformRole(user)) return true;
  const membership = await models.ProjectMember.findOne({ where: { projectId, userId: user.id } });
  if (!membership) throw forbidden('No access to this project');
  const allowed = developerAllowed ? [...projectWriteRoles, 'DEVELOPER'] : projectWriteRoles;
  if (write && !allowed.includes(membership.role)) throw forbidden('Project write role required');
  return true;
}

export async function assertQueueAccess(user, queueId, write = false, developerAllowed = false) {
  const queue = await models.JobQueue.findByPk(queueId);
  if (!queue) throw notFound('Queue');
  await assertProjectAccess(user, queue.projectId, write, developerAllowed);
  return queue;
}
