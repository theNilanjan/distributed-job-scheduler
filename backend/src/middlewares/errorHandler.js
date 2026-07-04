import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  next(Object.assign(new Error(`Route ${req.method} ${req.originalUrl} not found`), { statusCode: 404 }));
}

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || (error instanceof ZodError ? 400 : 500);
  const response = {
    success: false,
    message: error instanceof ZodError ? 'Validation failed' : error.message || 'Internal server error'
  };

  if (error instanceof ZodError) {
    response.details = error.flatten();
  } else if (error.details) {
    response.details = error.details;
  }

  if (statusCode >= 500) {
    logger.error('Unhandled request error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl
    });
  }

  res.status(statusCode).json(response);
}
