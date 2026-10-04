import { z } from 'zod'

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Email must be a valid email address')
  .max(254, 'Email must be 254 characters or fewer')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => Buffer.byteLength(password, 'utf8') <= 72,
    'Password must be 72 bytes or fewer',
  )

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be 100 characters or fewer')

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  })
  .strict()

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  })
  .strict()

export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Name or email is required',
  )

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .strict()
