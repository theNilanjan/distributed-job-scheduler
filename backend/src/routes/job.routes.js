import { Router } from 'express';
import * as controller from '../controllers/job.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { createBatchJobSchema, createJobSchema, transitionJobSchema, updateJobSchema } from '../schemas/job.schema.js';

export const jobRouter = Router();

jobRouter.use(authenticate);
jobRouter.get('/', validate(listQuerySchema), controller.list);
jobRouter.post('/', validate(createJobSchema), controller.create);
jobRouter.post('/batch', validate(createBatchJobSchema), controller.createBatch);
jobRouter.get('/:id', validate(idParamSchema), controller.get);
jobRouter.patch('/:id', validate(updateJobSchema), controller.update);
jobRouter.post('/:id/cancel', validate(idParamSchema), controller.cancel);
jobRouter.post('/:id/transition', validate(transitionJobSchema), controller.transition);
jobRouter.delete('/:id', validate(idParamSchema), controller.remove);
