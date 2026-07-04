import { models, sequelize } from '../models/index.js';
import { assertOrganizationAccess, hasPlatformRole } from './access.service.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { buildListOptions } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';

export async function listOrganizations(user, query) {
  const options = buildListOptions(query, ['name', 'slug'], ['createdAt', 'name', 'slug']);
  if (!hasPlatformRole(user)) {
    const memberships = await models.OrganizationMember.findAll({ where: { userId: user.id }, attributes: ['organizationId'] });
    options.where.id = memberships.map((membership) => membership.organizationId);
  }
  const result = await models.Organization.findAndCountAll({ ...options, distinct: true });
  return paginatedResponse(result, options);
}

export async function createOrganization(user, payload) {
  if (!hasPlatformRole(user)) throw badRequest('Only platform administrators can create organizations');
  return models.Organization.create(payload);
}

export async function getOrganization(user, id) {
  await assertOrganizationAccess(user, id);
  const organization = await models.Organization.findByPk(id, {
    include: [{ model: models.OrganizationMember, as: 'memberships', include: [{ model: models.User, as: 'user', attributes: ['id', 'name', 'email', 'status'] }] }]
  });
  if (!organization) throw notFound('Organization');
  return organization;
}

export async function updateOrganization(user, id, payload) {
  await assertOrganizationAccess(user, id, true);
  const organization = await models.Organization.findByPk(id);
  if (!organization) throw notFound('Organization');
  await organization.update(payload);
  return organization;
}

export async function deleteOrganization(user, id) {
  await assertOrganizationAccess(user, id, true);
  const organization = await models.Organization.findByPk(id);
  if (!organization) throw notFound('Organization');
  await organization.destroy();
  return { deleted: true };
}

export async function upsertOrganizationMember(user, organizationId, payload) {
  await assertOrganizationAccess(user, organizationId, true);
  const targetUser = await models.User.findByPk(payload.userId);
  if (!targetUser) throw notFound('User');
  const [membership] = await models.OrganizationMember.findOrCreate({
    where: { organizationId, userId: payload.userId },
    defaults: { role: payload.role }
  });
  if (membership.role !== payload.role) await membership.update({ role: payload.role });
  return membership;
}

export async function removeOrganizationMember(user, organizationId, userId) {
  await assertOrganizationAccess(user, organizationId, true);
  const deleted = await sequelize.transaction(async (transaction) => models.OrganizationMember.destroy({ where: { organizationId, userId }, transaction }));
  return { deleted: deleted > 0 };
}
