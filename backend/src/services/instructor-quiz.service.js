import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertCourseOwnership } from '../utils/course-access.js'
import { requireOwnedCourse } from './course.service.js'

const optionSelect = {
  id: true,
  text: true,
  isCorrect: true,
  questionId: true,
  createdAt: true,
  updatedAt: true,
}

const questionSelect = {
  id: true,
  text: true,
  order: true,
  quizId: true,
  createdAt: true,
  updatedAt: true,
  options: { select: optionSelect, orderBy: { createdAt: 'asc' } },
}

const quizSummarySelect = {
  id: true,
  title: true,
  description: true,
  isPublished: true,
  courseId: true,
  lessonId: true,
  createdAt: true,
  updatedAt: true,
  lesson: { select: { id: true, title: true } },
  _count: { select: { questions: true, attempts: true } },
}

const quizDetailSelect = {
  ...quizSummarySelect,
  course: { select: { id: true, title: true, instructorId: true } },
  questions: {
    select: questionSelect,
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  },
}

const requireLessonInCourse = async (lessonId, courseId, database) => {
  if (lessonId === null || lessonId === undefined) return

  const lesson = await database.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, courseId: true },
  })

  if (!lesson || lesson.courseId !== courseId) {
    throw new AppError(400, 'The selected lesson does not belong to this course', 'INVALID_QUIZ_LESSON')
  }
}

export const requireOwnedQuiz = async (quizId, instructorId, database = prisma) => {
  const quiz = await database.quiz.findUnique({
    where: { id: quizId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  })

  if (!quiz) throw new AppError(404, 'Quiz was not found', 'QUIZ_NOT_FOUND')
  assertCourseOwnership({ instructorId: quiz.course.instructorId }, instructorId)
  return quiz
}

const requireOwnedQuestion = async (questionId, instructorId, database = prisma) => {
  const question = await database.quizQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, quizId: true, quiz: { select: { course: { select: { instructorId: true } } } } },
  })

  if (!question) throw new AppError(404, 'Quiz question was not found', 'QUIZ_QUESTION_NOT_FOUND')
  assertCourseOwnership({ instructorId: question.quiz.course.instructorId }, instructorId)
  return question
}

const requireOwnedOption = async (optionId, instructorId, database = prisma) => {
  const option = await database.quizOption.findUnique({
    where: { id: optionId },
    select: { id: true, questionId: true, question: { select: { quiz: { select: { course: { select: { instructorId: true } } } } } } },
  })

  if (!option) throw new AppError(404, 'Quiz option was not found', 'QUIZ_OPTION_NOT_FOUND')
  assertCourseOwnership({ instructorId: option.question.quiz.course.instructorId }, instructorId)
  return option
}

export const listInstructorQuizzes = async (courseId, instructorId, database = prisma) => {
  await requireOwnedCourse(courseId, instructorId, database)
  return database.quiz.findMany({ where: { courseId }, select: quizSummarySelect, orderBy: { createdAt: 'desc' } })
}

export const createQuiz = async (courseId, instructorId, input, database = prisma) => {
  await requireOwnedCourse(courseId, instructorId, database)
  await requireLessonInCourse(input.lessonId, courseId, database)
  return database.quiz.create({ data: { ...input, courseId }, select: quizDetailSelect })
}

export const getInstructorQuiz = async (quizId, instructorId, database = prisma) => {
  await requireOwnedQuiz(quizId, instructorId, database)
  return database.quiz.findUnique({ where: { id: quizId }, select: quizDetailSelect })
}

export const updateQuiz = async (quizId, instructorId, input, database = prisma) => {
  const quiz = await requireOwnedQuiz(quizId, instructorId, database)
  await requireLessonInCourse(input.lessonId, quiz.courseId, database)
  return database.quiz.update({ where: { id: quizId }, data: input, select: quizDetailSelect })
}

export const deleteQuiz = async (quizId, instructorId, database = prisma) => {
  await requireOwnedQuiz(quizId, instructorId, database)
  await database.quiz.delete({ where: { id: quizId } })
}

export const createQuestion = async (quizId, instructorId, input, database = prisma) => {
  await requireOwnedQuiz(quizId, instructorId, database)
  return database.quizQuestion.create({ data: { ...input, quizId }, select: questionSelect })
}

export const updateQuestion = async (questionId, instructorId, input, database = prisma) => {
  await requireOwnedQuestion(questionId, instructorId, database)
  return database.quizQuestion.update({ where: { id: questionId }, data: input, select: questionSelect })
}

export const deleteQuestion = async (questionId, instructorId, database = prisma) => {
  await requireOwnedQuestion(questionId, instructorId, database)
  await database.quizQuestion.delete({ where: { id: questionId } })
}

export const createOption = async (questionId, instructorId, input, database = prisma) => {
  await requireOwnedQuestion(questionId, instructorId, database)
  if (!input.isCorrect) return database.quizOption.create({ data: { ...input, questionId }, select: optionSelect })

  return database.$transaction(async (transaction) => {
    await transaction.quizOption.updateMany({ where: { questionId }, data: { isCorrect: false } })
    return transaction.quizOption.create({ data: { ...input, questionId }, select: optionSelect })
  })
}

export const updateOption = async (optionId, instructorId, input, database = prisma) => {
  const option = await requireOwnedOption(optionId, instructorId, database)
  if (!input.isCorrect) return database.quizOption.update({ where: { id: optionId }, data: input, select: optionSelect })

  return database.$transaction(async (transaction) => {
    await transaction.quizOption.updateMany({ where: { questionId: option.questionId, id: { not: optionId } }, data: { isCorrect: false } })
    return transaction.quizOption.update({ where: { id: optionId }, data: input, select: optionSelect })
  })
}

export const deleteOption = async (optionId, instructorId, database = prisma) => {
  await requireOwnedOption(optionId, instructorId, database)
  await database.quizOption.delete({ where: { id: optionId } })
}

export const setQuizPublication = async (quizId, instructorId, isPublished, database = prisma) => {
  await requireOwnedQuiz(quizId, instructorId, database)

  if (isPublished) {
    const quiz = await database.quiz.findUnique({
      where: { id: quizId },
      select: { questions: { select: { id: true, options: { select: { isCorrect: true } } } } },
    })

    if (quiz.questions.length === 0) {
      throw new AppError(409, 'A quiz must have at least one question before it can be published', 'QUIZ_NOT_READY')
    }

    const invalidQuestion = quiz.questions.find((question) => question.options.length < 2 || question.options.filter((option) => option.isCorrect).length !== 1)
    if (invalidQuestion) {
      throw new AppError(409, 'Every question must have at least two options and exactly one correct option', 'QUIZ_NOT_READY')
    }
  }

  return database.quiz.update({ where: { id: quizId }, data: { isPublished }, select: quizDetailSelect })
}
