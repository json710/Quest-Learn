import { z } from 'zod'

const idSchema = z
  .string()
  .trim()
  .min(1, 'Resource ID is required')
  .max(64, 'Resource ID is invalid')

const titleSchema = z
  .string()
  .trim()
  .min(3, 'Title must be at least 3 characters')
  .max(150, 'Title must be 150 characters or fewer')

const positionSchema = z
  .number()
  .int('Position must be an integer')
  .min(0, 'Position must be 0 or greater')

const atLeastOneField = (data) => Object.keys(data).length > 0

export const courseIdParamsSchema = z
  .object({ courseId: idSchema })
  .strict()

export const lessonIdParamsSchema = z
  .object({ lessonId: idSchema })
  .strict()

export const taskIdParamsSchema = z.object({ taskId: idSchema }).strict()

export const createCourseSchema = z
  .object({
    title: titleSchema,
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(10000, 'Description must be 10000 characters or fewer'),
    isPublished: z.boolean().optional(),
  })
  .strict()

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine(atLeastOneField, 'At least one field is required')

export const createLessonSchema = z
  .object({
    title: titleSchema,
    content: z
      .string()
      .trim()
      .min(1, 'Lesson content is required')
      .max(50000, 'Lesson content must be 50000 characters or fewer'),
    position: positionSchema.optional(),
  })
  .strict()

export const updateLessonSchema = createLessonSchema
  .partial()
  .refine(atLeastOneField, 'At least one field is required')

export const createLearningTaskSchema = z
  .object({
    title: titleSchema,
    description: z
      .string()
      .trim()
      .min(1, 'Task description is required')
      .max(10000, 'Task description must be 10000 characters or fewer'),
    position: positionSchema.optional(),
  })
  .strict()

export const updateLearningTaskSchema = createLearningTaskSchema
  .partial()
  .refine(atLeastOneField, 'At least one field is required')
