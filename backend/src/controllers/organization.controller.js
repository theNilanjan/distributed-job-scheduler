import * as service from '../services/organization.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { created, success } from '../utils/response.js';

export const list = asyncHandler(async (req, res) => success(res, await service.listOrganizations(req.user, req.query)));
export const create = asyncHandler(async (req, res) => created(res, await service.createOrganization(req.user, req.body)));
export const get = asyncHandler(async (req, res) => success(res, await service.getOrganization(req.user, req.params.id)));
export const update = asyncHandler(async (req, res) => success(res, await service.updateOrganization(req.user, req.params.id, req.body)));
export const remove = asyncHandler(async (req, res) => success(res, await service.deleteOrganization(req.user, req.params.id)));
export const addMember = asyncHandler(async (req, res) => success(res, await service.upsertOrganizationMember(req.user, req.params.id, req.body)));
export const removeMember = asyncHandler(async (req, res) => success(res, await service.removeOrganizationMember(req.user, req.params.id, req.params.userId)));
