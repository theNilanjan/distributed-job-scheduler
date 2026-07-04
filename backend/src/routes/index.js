import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { healthRouter } from './health.routes.js';
import { organizationRouter } from './organization.routes.js';
import { projectRouter } from './project.routes.js';
import { queueRouter } from './queue.routes.js';
import { retryPolicyRouter } from './retryPolicy.routes.js';
import { jobRouter } from './job.routes.js';
import { workerRouter } from './worker.routes.js';
import { deadLetterRouter } from './deadLetter.routes.js';
import { logRouter } from './log.routes.js';
import { distributedLockRouter } from './distributedLock.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/organizations', organizationRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/queues', queueRouter);
apiRouter.use('/retry-policies', retryPolicyRouter);
apiRouter.use('/jobs', jobRouter);
apiRouter.use('/workers', workerRouter);
apiRouter.use('/dead-letter-jobs', deadLetterRouter);
apiRouter.use('/logs', logRouter);
apiRouter.use('/locks', distributedLockRouter);
