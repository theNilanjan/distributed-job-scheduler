import { Router } from 'express';
import { login, logout, me, refresh, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User registered
 */
authRouter.post('/register', validate(registerSchema), register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT tokens
 *     responses:
 *       200:
 *         description: Authenticated
 */
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/refresh', validate(refreshSchema), refresh);
authRouter.post('/logout', authenticate, validate(logoutSchema), logout);
authRouter.get('/me', authenticate, me);
