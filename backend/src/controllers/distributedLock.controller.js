import { asyncHandler } from '../middlewares/asyncHandler.js';
import { acquireDistributedLock, cleanupExpiredLocks, extendDistributedLock, releaseDistributedLock } from '../services/distributedLock.service.js';
import { success } from '../utils/response.js';

export const acquire = asyncHandler(async (req, res) => {
  const acquired = await acquireDistributedLock(req.body.name, req.body.owner || 'default', req.body.ttlSeconds || 30, req.body.metadata || {});
  success(res, { acquired });
});

export const extend = asyncHandler(async (req, res) => {
  const extended = await extendDistributedLock(req.params.name, req.body.owner || 'default', req.body.ttlSeconds || 30, req.body.metadata || {});
  success(res, { extended });
});

export const release = asyncHandler(async (req, res) => {
  const released = await releaseDistributedLock(req.params.name, req.body.owner || 'default');
  success(res, { released });
});

export const cleanup = asyncHandler(async (_req, res) => {
  const removed = await cleanupExpiredLocks();
  success(res, { removed });
});
