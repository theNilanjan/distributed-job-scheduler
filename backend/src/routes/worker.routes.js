import { Router } from 'express';
import * as controller from '../controllers/worker.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { idParamSchema, listQuerySchema } from '../schemas/common.schema.js';
import { claimJobsSchema, completeClaimedJobSchema, failClaimedJobSchema, heartbeatSchema, registerWorkerSchema } from '../schemas/worker.schema.js';

export const workerRouter = Router();

workerRouter.use(authenticate);
workerRouter.get('/', validate(listQuerySchema), controller.list);
workerRouter.post('/', validate(registerWorkerSchema), controller.register);
workerRouter.post('/claim', validate(claimJobsSchema), controller.claim);
workerRouter.post('/recover-abandoned', controller.recover);
workerRouter.post('/:id/heartbeat', validate(heartbeatSchema), controller.heartbeat);
workerRouter.post('/:id/drain', validate(idParamSchema), controller.drain);
workerRouter.post('/:id/stop', validate(idParamSchema), controller.stop);
workerRouter.post('/jobs/:id/running', validate(completeClaimedJobSchema), controller.markRunning);
workerRouter.post('/jobs/:id/complete', validate(completeClaimedJobSchema), controller.complete);
workerRouter.post('/jobs/:id/fail', validate(failClaimedJobSchema), controller.fail);
