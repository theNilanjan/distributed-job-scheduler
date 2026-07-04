import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    organizationId: z.coerce.number().int().positive(),
    name: z.string().trim().min(2).max(140),
    key: z.string().trim().regex(/^[A-Z][A-Z0-9_]{1,39}$/),
    description: z.string().trim().max(5000).optional()
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().trim().min(2).max(140).optional(),
    key: z.string().trim().regex(/^[A-Z][A-Z0-9_]{1,39}$/).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional()
  })
});

export const projectMemberSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    userId: z.coerce.number().int().positive(),
    role: z.enum(['PROJECT_ADMIN', 'DEVELOPER', 'VIEWER'])
  })
});
