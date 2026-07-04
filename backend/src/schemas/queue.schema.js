import { z } from 'zod';

export const createQueueSchema = z.object({
  body: z.object({
    projectId: z.coerce.number().int().positive(),
    retryPolicyId: z.coerce.number().int().positive().nullable().optional(),
    name: z.string().trim().min(2).max(140),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
    priority: z.coerce.number().int().min(-1000).max(1000).default(0),
    concurrencyLimit: z.coerce.number().int().min(1).max(1000).default(5),
    rateLimitPerMinute: z.coerce.number().int().min(1).max(100000).nullable().optional(),
    shardKey: z.string().trim().max(80).nullable().optional()
  })
});

export const updateQueueSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: createQueueSchema.shape.body.omit({ projectId: true }).partial().extend({
    status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional()
  })
});
