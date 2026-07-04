import { Router } from 'express';
import { dashboardSummary } from '../controllers/bootstrap.controller.js';
import { authenticate } from '../middlewares/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, dashboardSummary);
