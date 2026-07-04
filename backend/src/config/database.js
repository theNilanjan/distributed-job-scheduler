import { Sequelize } from 'sequelize';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: env.DB_DIALECT,
  logging: env.NODE_ENV === 'development' ? (message) => logger.debug(message) : false,
  pool: {
    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    acquire: env.DB_POOL_ACQUIRE,
    idle: env.DB_POOL_IDLE
  },
  define: {
    underscored: true,
    timestamps: true
  },
  timezone: '+00:00'
});

export async function assertDatabaseConnection() {
  await sequelize.authenticate();
  logger.info('Database connection established');
}
