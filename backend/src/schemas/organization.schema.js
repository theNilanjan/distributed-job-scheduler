import { z } from 'zod';

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(140),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
    description: z.string().trim().max(5000).optional()
  })
});

export const updateOrganizationSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    name: z.string().trim().min(2).max(140).optional(),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160).optional(),
    description: z.string().trim().max(5000).nullable().optional()
  })
});

export const organizationMemberSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
  body: z.object({
    userId: z.coerce.number().int().positive(),
    role: z.enum(['ORG_ADMIN', 'MEMBER', 'VIEWER'])
  })
});
