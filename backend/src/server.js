import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { assertDatabaseConnection } from './config/database.js';
import { configureSocket } from './socket/index.js';
import { logger } from './utils/logger.js';

function resolvePort(defaultPort) {
  const requestedPort = Number(process.env.PORT || defaultPort);
  if (!Number.isInteger(requestedPort) || requestedPort <= 0) return defaultPort;
  return requestedPort;
}

async function bootstrap() {
  await assertDatabaseConnection();

  const app = createApp();
  const server = http.createServer(app);
  configureSocket(server);

  const port = resolvePort(env.PORT);
  server.listen(port, () => {
    logger.info(`API listening on port ${port}`);
    logger.info(`Swagger available at http://localhost:${port}/api-docs`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use; set PORT to a free port and retry`, { error: error.message });
      process.exit(1);
    }
    throw error;
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}; shutting down API`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start API', { error: error.message, stack: error.stack });
  process.exit(1);
});
