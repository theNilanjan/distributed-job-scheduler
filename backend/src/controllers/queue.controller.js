import * as service from '../services/queue.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listQueues(req.user, req.query)));
export const create = asyncHandler(async (req, res) => created(res, await service.createQueue(req.user, req.body)));
export const get = asyncHandler(async (req, res) => success(res, await service.getQueue(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) => success(res, await service.updateQueue(req.user, req.params.id, req.body)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteQueue(req.user, req.params.id)));
export const pause = asyncHandler(async (req, res) => success(res, await service.pauseQueue(req.user, req.params.id)));
export const resume = asyncHandler(async (req, res) => success(res, await service.resumeQueue(req.user, req.params.id)));
export const statistics = asyncHandler(async (req, res) => success(res, await service.queueStatistics(req.user, req.params.id)));
