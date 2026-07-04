import { assertDatabaseConnection } from '../config/database.js';
import { WorkerRuntime } from './runtime.js';
import { logger } from '../utils/logger.js';

async function main() {
  await assertDatabaseConnection();
  const worker = new WorkerRuntime({
    concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
    pollIntervalMs: Number(process.env.WORKER_POLL_INTERVAL_MS || 2000)
  });
  await worker.start();

  const shutdown = async (signal) => {
    logger.info(`Worker received ${signal}; graceful shutdown started`);
    await worker.shutdown();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.error('Worker failed to start', { error: error.message, stack: error.stack });
  process.exit(1);
});
