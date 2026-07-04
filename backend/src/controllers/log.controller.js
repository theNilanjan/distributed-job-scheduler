import * as service from '../services/log.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { success } from '../utils/response.js';

export const jobLogs = asyncHandler(async (req, res) => success(res, await service.listJobLogs(req.user, req.query)));
export const workerLogs = asyncHandler(async (req, res) => success(res, await service.listWorkerLogs(req.query)));
export const executions = asyncHandler(async (req, res) => success(res, await service.listExecutions(req.user, req.query)));
