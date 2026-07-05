import { models } from '../models/index.js';
import { assertOrganizationAccess, assertProjectAccess, hasPlatformRole } from './access.service.js';
import { notFound } from '../utils/httpError.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';

export async function listProjects(user, query) {
  const options = buildListOptions(query, ['name', 'key'], ['createdAt', 'name', 'key']);
  applyExactFilters(options.where, query, ['organizationId', 'status']);
  if (!hasPlatformRole(user)) {
    const memberships = await models.ProjectMember.findAll({ where: { userId: user.id }, attributes: ['projectId'] });
    options.where.id = memberships.map((membership) => membership.projectId);
  }
  if (query.organizationId) await assertOrganizationAccess(user, query.organizationId);
  const result = await models.Project.findAndCountAll({ ...options, include: [{ model: models.Organization, as: 'organization' }], distinct: true });
  return paginatedResponse(result, options);
}

export async function createProject(user, payload) {
  await assertOrganizationAccess(user, payload.organizationId, true);
  const project = await models.Project.create(payload);
  await models.ProjectMember.findOrCreate({ where: { projectId: project.id, userId: user.id }, defaults: { role: 'PROJECT_ADMIN' } });
  return project;
}

export async function getProject(user, id) {
  await assertProjectAccess(user, id);
  const project = await models.Project.findByPk(id, {
    include: [
      { model: models.Organization, as: 'organization' },
      { model: models.ProjectMember, as: 'memberships', include: [{ model: models.User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }] }
    ]
  });
  if (!project) throw notFound('Project');
  return project;
}

export async function updateProject(user, id, payload) {
  await assertProjectAccess(user, id, true);
  const project = await models.Project.findByPk(id);
  if (!project) throw notFound('Project');
  await project.update(payload);
  return project;
}

export async function deleteProject(user, id) {
  await assertProjectAccess(user, id, true);
  const project = await models.Project.findByPk(id);
  if (!project) throw notFound('Project');
  await project.destroy();
  return { deleted: true };
}

export async function upsertProjectMember(user, projectId, payload) {
  await assertProjectAccess(user, projectId, true);
  const targetUser = await models.User.findByPk(payload.userId);
  if (!targetUser) throw notFound('User');
  const [membership] = await models.ProjectMember.findOrCreate({
    where: { projectId, userId: payload.userId },
    defaults: { role: payload.role }
  });
  if (membership.role !== payload.role) await membership.update({ role: payload.role });
  return membership;
}

export async function removeProjectMember(user, projectId, userId) {
  await assertProjectAccess(user, projectId, true);
  const deleted = await models.ProjectMember.destroy({ where: { projectId, userId } });
  return { deleted: deleted > 0 };
}
