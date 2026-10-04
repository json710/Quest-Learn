import { z } from 'zod'

const roleSchema = z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN'], {
  error: 'Role must be STUDENT, INSTRUCTOR, or ADMIN',
})

const userIdSchema = z
  .string()
  .trim()
  .min(1, 'User ID is required')
  .max(64, 'User ID is invalid')

export const adminUserParamsSchema = z
  .object({ userId: userIdSchema })
  .strict()

export const adminUserListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    role: roleSchema.optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().trim().max(100).optional(),
  })
  .strict()

export const updateUserRoleSchema = z
  .object({ role: roleSchema })
  .strict()

export const updateUserStatusSchema = z
  .object({ isActive: z.boolean() })
  .strict()
