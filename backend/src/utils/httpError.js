export class HttpError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Authentication required') => new HttpError(401, message);
export const forbidden = (message = 'Insufficient permissions') => new HttpError(403, message);
export const notFound = (resource = 'Resource') => new HttpError(404, `${resource} not found`);
