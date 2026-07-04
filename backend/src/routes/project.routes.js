import { Router } from 'express';
import * as controller from '../controllers/project.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { createProjectSchema, projectMemberSchema, updateProjectSchema } from '../schemas/project.schema.js';

export const projectRouter = Router();

projectRouter.use(authenticate);
projectRouter.get('/', validate(listQuerySchema), controller.list);
projectRouter.post('/', validate(createProjectSchema), controller.create);
projectRouter.get('/:id', validate(idParamSchema), controller.get);
projectRouter.patch('/:id', validate(updateProjectSchema), controller.update);
projectRouter.delete('/:id', validate(idParamSchema), controller.remove);
projectRouter.post('/:id/members', validate(projectMemberSchema), controller.addMember);
projectRouter.delete('/:id/members/:userId', controller.removeMember);
