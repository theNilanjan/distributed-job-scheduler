import * as service from '../services/retryPolicy.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listRetryPolicies(req.query)));
export const create = asyncHandler(async (req, res) => created(res, await service.createRetryPolicy(req.user, req.body)));
export const get = asyncHandler(async (req, res) => success(res, await service.getRetryPolicy(req.params.id)));
export const update = asyncHandler(async (req, res) => success(res, await service.updateRetryPolicy(req.user, req.params.id, req.body)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteRetryPolicy(req.user, req.params.id)));
