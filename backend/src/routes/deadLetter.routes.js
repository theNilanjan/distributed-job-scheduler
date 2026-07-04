import { Router } from 'express';
import * as controller from '../controllers/deadLetter.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';

export const deadLetterRouter = Router();

deadLetterRouter.use(authenticate);
deadLetterRouter.get('/', validate(listQuerySchema), controller.list);
deadLetterRouter.get('/:id', validate(idParamSchema), controller.get);
deadLetterRouter.post('/:id/retry', validate(idParamSchema), controller.retry);
deadLetterRouter.delete('/:id', validate(idParamSchema), controller.remove);
