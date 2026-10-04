import { z } from 'zod'

const idSchema = z
  .string()
  .trim()
  .min(1, 'Resource ID is required')
  .max(64, 'Resource ID is invalid')

const contentSchema = z
  .string()
  .trim()
  .min(1, 'Submission content is required')
  .max(50000, 'Submission content must be 50000 characters or fewer')

export const taskSubmissionParamsSchema = z
  .object({ taskId: idSchema })
  .strict()

export const submissionIdParamsSchema = z
  .object({ submissionId: idSchema })
  .strict()

export const submitWorkSchema = z.object({ content: contentSchema }).strict()

export const updateSubmissionSchema = z
  .object({ content: contentSchema })
  .strict()

export const reviewSubmissionSchema = z
  .object({
    score: z
      .number()
      .int('Score must be an integer')
      .min(0, 'Score must be at least 0')
      .max(100, 'Score must be 100 or less'),
    feedback: z
      .string()
      .trim()
      .min(1, 'Feedback is required')
      .max(5000, 'Feedback must be 5000 characters or fewer'),
  })
  .strict()
