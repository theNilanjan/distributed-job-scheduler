import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(190).toLowerCase(),
    password: z.string().min(8).max(128)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(190).toLowerCase(),
    password: z.string().min(8).max(128)
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20)
  })
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20).optional()
  }).optional()
});
