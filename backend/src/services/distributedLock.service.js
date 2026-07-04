import { Op } from 'sequelize';
import { models } from '../models/index.js';

export async function acquireDistributedLock(name, owner, ttlSeconds, metadata = {}) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const existing = await models.DistributedLock.findByPk(name);
  if (existing && existing.expiresAt > new Date()) {
    return false;
  }

  const [lock, created] = await models.DistributedLock.findOrCreate({
    where: { name },
    defaults: { owner, expiresAt, metadata }
  });
  if (!created && lock.expiresAt <= new Date()) {
    await lock.update({ owner, expiresAt, metadata });
    return true;
  }
  if (!created) {
    return false;
  }
  return true;
}

export async function extendDistributedLock(name, owner, ttlSeconds, metadata = {}) {
  const lock = await models.DistributedLock.findByPk(name);
  if (!lock || lock.owner !== owner) return false;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await lock.update({ expiresAt, metadata });
  return true;
}

export async function releaseDistributedLock(name, owner) {
  const lock = await models.DistributedLock.findByPk(name);
  if (!lock || lock.owner !== owner) return false;
  await lock.destroy();
  return true;
}

export async function cleanupExpiredLocks() {
  const now = new Date();
  const deleted = await models.DistributedLock.destroy({ where: { expiresAt: { [Op.lte]: now } } });
  return deleted;
}
