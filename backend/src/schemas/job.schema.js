import { z } from 'zod';

const payloadSchema = z.record(z.any()).default({});

export const createJobSchema = z.object({
  body: z.object({
    queueId: z.coerce.number().int().positive(),
    type: z.enum(['IMMEDIATE', 'DELAYED', 'SCHEDULED', 'CRON', 'BATCH']),
    name: z.string().trim().min(2).max(180),
    payload: payloadSchema,
    priority: z.coerce.number().int().min(-1000).max(1000).default(0),
    idempotencyKey: z.string().trim().max(160).optional(),
    delaySeconds: z.coerce.number().int().positive().optional(),
    runAt: z.coerce.date().optional(),
    cronExpression: z.string().trim().max(120).optional(),
    timezone: z.string().trim().max(80).default('UTC'),
    maxAttempts: z.coerce.number().int().min(1).max(50).optional(),
    executionTimeoutSeconds: z.coerce.number().int().min(1).max(86400).default(300)
  })
});

export const createBatchJobSchema = z.object({
  body: z.object({
    queueId: z.coerce.number().int().positive(),
    batchId: z.string().trim().min(2).max(80).optional(),
    jobs: z.array(z.object({
      name: z.string().trim().min(2).max(180),
      payload: payloadSchema,
      priority: z.coerce.number().int().min(-1000).max(1000).default(0),
      idempotencyKey: z.string().trim().max(160).optional()
    })).min(1).max(500)
  })
});

export const updateJobSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().trim().min(2).max(180).optional(),
    payload: payloadSchema.optional(),
    priority: z.coerce.number().int().min(-1000).max(1000).optional(),
    runAt: z.coerce.date().optional(),
    executionTimeoutSeconds: z.coerce.number().int().min(1).max(86400).optional()
  })
});

export const transitionJobSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    status: z.enum(['RUNNING', 'COMPLETED', 'FAILED']),
    result: z.record(z.any()).optional(),
    errorMessage: z.string().max(10000).optional(),
    stackTrace: z.string().max(100000).optional()
  })
});
