import { z } from 'zod';

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() })
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortDir: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional()
  }).passthrough()
});
