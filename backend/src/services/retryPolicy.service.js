import { models } from '../models/index.js';
import { hasPlatformRole } from './access.service.js';
import { forbidden, notFound } from '../utils/httpError.js';
import { buildListOptions, applyExactFilters } from '../utils/query.js';
import { paginatedResponse } from '../utils/pagination.js';

function assertPolicyWrite(user) {
  if (!hasPlatformRole(user) && !user.roles.includes('ORG_ADMIN') && !user.roles.includes('PROJECT_ADMIN')) {
    throw forbidden('Policy write access required');
  }
}

export async function listRetryPolicies(user, query) {
  const options = buildListOptions(query, ['name'], ['createdAt', 'name', 'strategy']);
  applyExactFilters(options.where, query, ['strategy']);
  return paginatedResponse(await models.RetryPolicy.findAndCountAll(options), options);
}

export async function createRetryPolicy(user, payload) {
  assertPolicyWrite(user);
  return models.RetryPolicy.create(payload);
}

export async function getRetryPolicy(id) {
  const policy = await models.RetryPolicy.findByPk(id, { include: [{ model: models.JobQueue, as: 'queues' }] });
  if (!policy) throw notFound('Retry policy');
  return policy;
}

export async function updateRetryPolicy(user, id, payload) {
  assertPolicyWrite(user);
  const policy = await models.RetryPolicy.findByPk(id);
  if (!policy) throw notFound('Retry policy');
  await policy.update(payload);
  return policy;
}

export async function deleteRetryPolicy(user, id) {
  assertPolicyWrite(user);
  const policy = await models.RetryPolicy.findByPk(id);
  if (!policy) throw notFound('Retry policy');
  await policy.destroy();
  return { deleted: true };
}

export function calculateRetryDelay(policy, attemptNumber) {
  const base = policy.baseDelaySeconds;
  let delay = base;
  if (policy.strategy === 'LINEAR') delay = base * attemptNumber;
  if (policy.strategy === 'EXPONENTIAL') delay = base * (2 ** Math.max(attemptNumber - 1, 0));
  delay = Math.min(delay, policy.maxDelaySeconds);
  if (policy.jitterEnabled) delay += Math.floor(Math.random() * Math.min(base, 30));
  return delay;
}
