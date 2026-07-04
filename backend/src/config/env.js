import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  API_BASE_URL: z.string().url().default('http://localhost:5000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  WORKER_PORT: z.coerce.number().int().positive().default(5001),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default('job_scheduler'),
  DB_USER: z.string().default('jobscheduler'),
  DB_PASSWORD: z.string().default('jobscheduler_password'),
  DB_DIALECT: z.literal('mysql').default('mysql'),
  DB_POOL_MAX: z.coerce.number().int().positive().default(20),
  DB_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DB_POOL_ACQUIRE: z.coerce.number().int().positive().default(30000),
  DB_POOL_IDLE: z.coerce.number().int().positive().default(10000),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  WORKER_HEARTBEAT_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(60),
  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
