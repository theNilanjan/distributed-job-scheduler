import { z } from 'zod';

export const registerWorkerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(140),
    hostname: z.string().trim().min(2).max(190),
    maxConcurrency: z.coerce.number().int().min(1).max(1000).default(5)
  })
});

export const heartbeatSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    activeJobs: z.coerce.number().int().min(0),
    capacity: z.coerce.number().int().min(0),
    metadata: z.record(z.any()).optional()
  })
});

export const claimJobsSchema = z.object({
  body: z.object({
    workerId: z.coerce.number().int().positive(),
    queueId: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(5)
  })
});

export const completeClaimedJobSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    workerId: z.coerce.number().int().positive(),
    result: z.record(z.any()).optional()
  })
});

export const failClaimedJobSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    workerId: z.coerce.number().int().positive(),
    errorMessage: z.string().min(1).max(10000),
    stackTrace: z.string().max(100000).optional()
  })
});
