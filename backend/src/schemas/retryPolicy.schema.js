import { z } from 'zod';

export const createRetryPolicySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    strategy: z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL']),
    maxAttempts: z.coerce.number().int().min(1).max(50).default(3),
    baseDelaySeconds: z.coerce.number().int().min(1).max(86400).default(30),
    maxDelaySeconds: z.coerce.number().int().min(1).max(604800).default(3600),
    jitterEnabled: z.boolean().default(true)
  })
});

export const updateRetryPolicySchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: createRetryPolicySchema.shape.body.partial()
});
