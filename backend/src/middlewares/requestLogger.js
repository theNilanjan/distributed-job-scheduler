import morgan from 'morgan';
import { logger } from '../utils/logger.js';

const stream = {
  write: (message) => logger.http(message.trim())
};

export const requestLogger = morgan('combined', { stream });
