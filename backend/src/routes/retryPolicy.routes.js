import { Router } from 'express';
import * as controller from '../controllers/retryPolicy.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { createRetryPolicySchema, updateRetryPolicySchema } from '../schemas/retryPolicy.schema.js';

export const retryPolicyRouter = Router();

retryPolicyRouter.use(authenticate);
retryPolicyRouter.get('/', validate(listQuerySchema), controller.list);
retryPolicyRouter.post('/', validate(createRetryPolicySchema), controller.create);
retryPolicyRouter.get('/:id', validate(idParamSchema), controller.get);
retryPolicyRouter.patch('/:id', validate(updateRetryPolicySchema), controller.update);
retryPolicyRouter.delete('/:id', validate(idParamSchema), controller.remove);
