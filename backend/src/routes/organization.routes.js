import { Router } from 'express';
import * as controller from '../controllers/organization.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { createOrganizationSchema, organizationMemberSchema, updateOrganizationSchema } from '../schemas/organization.schema.js';

export const organizationRouter = Router();

organizationRouter.use(authenticate);
organizationRouter.get('/', validate(listQuerySchema), controller.list);
organizationRouter.post('/', validate(createOrganizationSchema), controller.create);
organizationRouter.get('/:id', validate(idParamSchema), controller.get);
organizationRouter.patch('/:id', validate(updateOrganizationSchema), controller.update);
organizationRouter.delete('/:id', validate(idParamSchema), controller.remove);
organizationRouter.post('/:id/members', validate(organizationMemberSchema), controller.addMember);
organizationRouter.delete('/:id/members/:userId', controller.removeMember);
