import { Router } from 'express';
import * as controller from '../controllers/log.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { listQuerySchema } from '../schemas/common.schema.js';

export const logRouter = Router();

logRouter.use(authenticate);
logRouter.get('/job-logs', validate(listQuerySchema), controller.jobLogs);
logRouter.get('/worker-logs', validate(listQuerySchema), controller.workerLogs);
logRouter.get('/executions', validate(listQuerySchema), controller.executions);
