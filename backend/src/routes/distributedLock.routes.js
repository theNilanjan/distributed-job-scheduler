import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import * as controller from '../controllers/distributedLock.controller.js';

export const distributedLockRouter = Router();

distributedLockRouter.use(authenticate);
distributedLockRouter.post('/acquire', controller.acquire);
distributedLockRouter.post('/:name/extend', controller.extend);
distributedLockRouter.post('/:name/release', controller.release);
distributedLockRouter.post('/cleanup', controller.cleanup);
