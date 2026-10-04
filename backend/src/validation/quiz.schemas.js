import { z } from 'zod'

const idSchema = z.string().trim().min(1, 'Resource ID is required').max(64, 'Resource ID is invalid')
const titleSchema = z.string().trim().min(3, 'Title must be at least 3 characters').max(150, 'Title must be 150 characters or fewer')
const descriptionSchema = z.string().trim().min(1, 'Description is required').max(10000, 'Description must be 10000 characters or fewer')
const questionTextSchema = z.string().trim().min(1, 'Question text is required').max(5000, 'Question text must be 5000 characters or fewer')
const optionTextSchema = z.string().trim().min(1, 'Option text is required').max(1000, 'Option text must be 1000 characters or fewer')
const orderSchema = z.number().int('Order must be an integer').min(0, 'Order must be 0 or greater')
const atLeastOneField = (data) => Object.keys(data).length > 0

export const courseQuizParamsSchema = z.object({ courseId: idSchema }).strict()
export const quizParamsSchema = z.object({ quizId: idSchema }).strict()
export const questionParamsSchema = z.object({ questionId: idSchema }).strict()
export const optionParamsSchema = z.object({ optionId: idSchema }).strict()
export const attemptParamsSchema = z.object({ attemptId: idSchema }).strict()

export const createQuizSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  lessonId: idSchema.nullable().optional(),
}).strict()

export const updateQuizSchema = createQuizSchema.partial().refine(atLeastOneField, 'At least one field is required')

export const createQuestionSchema = z.object({
  text: questionTextSchema,
  order: orderSchema.optional(),
}).strict()

export const updateQuestionSchema = createQuestionSchema.partial().refine(atLeastOneField, 'At least one field is required')

export const createOptionSchema = z.object({
  text: optionTextSchema,
  isCorrect: z.boolean().optional(),
}).strict()

export const updateOptionSchema = createOptionSchema.partial().refine(atLeastOneField, 'At least one field is required')

export const quizPublicationSchema = z.object({ isPublished: z.boolean() }).strict()

export const submitAttemptSchema = z.object({
  answers: z.array(z.object({ questionId: idSchema, optionId: idSchema }).strict()).max(500, 'Too many answers were submitted'),
}).strict().superRefine((data, context) => {
  const questionIds = data.answers.map((answer) => answer.questionId)
  if (new Set(questionIds).size !== questionIds.length) {
    context.addIssue({ code: 'custom', path: ['answers'], message: 'Each question may be answered only once' })
  }
})
