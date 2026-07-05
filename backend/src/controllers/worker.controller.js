import * as service from '../services/worker.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listWorkers(req.user, req.query)));
export const register = asyncHandler(async (req, res) => created(res, await service.registerWorker(req.body)));
export const heartbeat = asyncHandler(async (req, res) => success(res, await service.heartbeat(req.params.id, req.body)));
export const claim = asyncHandler(async (req, res) => success(res, await service.claimJobs(req.body)));
export const markRunning = asyncHandler(async (req, res) => success(res, await service.markJobRunning(req.params.id, req.body.workerId)));
export const complete = asyncHandler(async (req, res) => success(res, await service.completeJob(req.params.id, req.body.workerId, req.body.result)));
export const fail = asyncHandler(async (req, res) => success(res, await service.failClaimedJob(req.params.id, req.body.workerId, req.body)));
export const drain = asyncHandler(async (req, res) => success(res, await service.drainWorker(req.params.id)));
export const stop = asyncHandler(async (req, res) => success(res, await service.stopWorker(req.params.id)));
export const recover = asyncHandler(async (_req, res) => success(res, await service.recoverAbandonedJobs()));
