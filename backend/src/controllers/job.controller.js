import * as service from '../services/job.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listJobs(req.user, req.query)));
export const create = asyncHandler(async (req, res) => created(res, await service.createJob(req.user, req.body)));
export const createBatch = asyncHandler(async (req, res) => created(res, await service.createBatchJobs(req.user, req.body)));
export const get = asyncHandler(async (req, res) => success(res, await service.getJob(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) => success(res, await service.updateJob(req.user, req.params.id, req.body)));
export const cancel = asyncHandler(async (req, res) => success(res, await service.cancelJob(req.user, req.params.id)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteJob(req.user, req.params.id)));
export const transition = asyncHandler(async (req, res) => success(res, await service.transitionJob(req.params.id, req.body.status, req.body)));
