import { Router } from 'express';
import * as controller from '../controllers/queue.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { createQueueSchema, updateQueueSchema } from '../schemas/queue.schema.js';

export const queueRouter = Router();

queueRouter.use(authenticate);
queueRouter.get('/', validate(listQuerySchema), controller.list);
queueRouter.post('/', validate(createQueueSchema), controller.create);
queueRouter.get('/:id', validate(idParamSchema), controller.get);
queueRouter.patch('/:id', validate(updateQueueSchema), controller.update);
queueRouter.delete('/:id', validate(idParamSchema), controller.remove);
queueRouter.post('/:id/pause', validate(idParamSchema), controller.pause);
queueRouter.post('/:id/resume', validate(idParamSchema), controller.resume);
queueRouter.get('/:id/statistics', validate(idParamSchema), controller.statistics);
