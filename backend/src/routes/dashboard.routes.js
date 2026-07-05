import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, getSummary);
