import * as service from '../services/project.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listProjects(req.user, req.query)));
export const create = asyncHandler(async (req, res) => created(res, await service.createProject(req.user, req.body)));
export const get = asyncHandler(async (req, res) => success(res, await service.getProject(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) => success(res, await service.updateProject(req.user, req.params.id, req.body)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteProject(req.user, req.params.id)));
export const addMember = asyncHandler(async (req, res) => success(res, await service.upsertProjectMember(req.user, req.params.id, req.body)));
export const removeMember = asyncHandler(async (req, res) => success(res, await service.removeProjectMember(req.user, req.params.id, req.params.userId)));
