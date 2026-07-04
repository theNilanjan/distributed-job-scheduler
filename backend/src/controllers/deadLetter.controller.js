import * as service from '../services/deadLetter.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listDeadLetterJobs(req.user, req.query)));
export const get = asyncHandler(async (req, res) => success(res, await service.getDeadLetterJob(req.user, req.params.id)));
export const retry = asyncHandler(async (req, res) => success(res, await service.retryDeadLetterJob(req.user, req.params.id)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteDeadLetterJob(req.user, req.params.id)));
