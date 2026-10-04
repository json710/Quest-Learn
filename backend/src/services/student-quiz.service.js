import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertEnrollment } from '../utils/course-access.js'
import {
  awardQuizSubmissionBadges,
  listBadgeAwardsForSource,
} from './badge.service.js'
import { awardQuizAttemptXp } from './gamification.service.js'

const xpRewardSelect = {
  amount: true,
  xpAfter: true,
  levelBefore: true,
  levelAfter: true,
}

const safeQuestionSelect = {
  id: true,
  text: true,
  order: true,
  options: {
    select: { id: true, text: true },
    orderBy: { createdAt: 'asc' },
  },
}

const safeQuizSelect = {
  id: true,
  title: true,
  description: true,
  isPublished: true,
  courseId: true,
  lessonId: true,
  course: { select: { id: true, title: true } },
  lesson: { select: { id: true, title: true } },
  questions: { select: safeQuestionSelect, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] },
}

const quizListSelect = {
  id: true,
  title: true,
  description: true,
  courseId: true,
  lessonId: true,
  course: { select: { id: true, title: true } },
  lesson: { select: { id: true, title: true } },
  _count: { select: { questions: true } },
}

const requireQuizAccess = async (studentId, quizId, database = prisma) => {
  const quiz = await database.quiz.findUnique({ where: { id: quizId }, select: { id: true, courseId: true, isPublished: true } })
  if (!quiz || !quiz.isPublished) throw new AppError(404, 'Quiz was not found', 'QUIZ_NOT_FOUND')

  const enrollment = await database.enrollment.findUnique({ where: { studentId_courseId: { studentId, courseId: quiz.courseId } }, select: { id: true } })
  assertEnrollment(enrollment)
  return quiz
}

export const listAvailableQuizzes = (studentId, database = prisma) =>
  database.quiz.findMany({
    where: { isPublished: true, course: { enrollments: { some: { studentId } } } },
    select: quizListSelect,
    orderBy: { createdAt: 'desc' },
  })

export const getAvailableQuiz = async (studentId, quizId, database = prisma) => {
  await requireQuizAccess(studentId, quizId, database)
  return database.quiz.findUnique({ where: { id: quizId }, select: safeQuizSelect })
}

export const startQuizAttempt = async (studentId, quizId, database = prisma) => {
  const quiz = await getAvailableQuiz(studentId, quizId, database)
  const attempt = await database.quizAttempt.create({
    data: { studentId, quizId },
    select: { id: true, quizId: true, studentId: true, startedAt: true, submittedAt: true, score: true },
  })
  return { attempt, quiz }
}

export const calculateQuizScore = (questions, answers) => {
  if (questions.length === 0) return 0
  const selectedByQuestion = new Map(answers.map((answer) => [answer.questionId, answer.optionId]))
  const correct = questions.filter((question) => question.options.some((option) => option.isCorrect && option.id === selectedByQuestion.get(question.id))).length
  return Math.round((correct / questions.length) * 100)
}

const findStudentAttempt = async (studentId, attemptId, database) => {
  const attempt = await database.quizAttempt.findFirst({
    where: { id: attemptId, studentId },
    select: {
      id: true,
      quizId: true,
      studentId: true,
      startedAt: true,
      submittedAt: true,
      score: true,
      quiz: {
        select: {
          id: true,
          title: true,
          description: true,
          course: { select: { id: true, title: true } },
          questions: {
            select: { id: true, text: true, order: true, options: { select: { id: true, text: true, isCorrect: true }, orderBy: { createdAt: 'asc' } } },
            orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          },
        },
      },
      answers: { select: { questionId: true, selectedOptionId: true } },
      xpReward: { select: xpRewardSelect },
    },
  })
  if (!attempt) throw new AppError(404, 'Quiz attempt was not found', 'QUIZ_ATTEMPT_NOT_FOUND')
  return attempt
}

export const submitQuizAttempt = async (studentId, attemptId, input, database = prisma) => {
  const attempt = await findStudentAttempt(studentId, attemptId, database)
  if (attempt.submittedAt) throw new AppError(409, 'A submitted quiz attempt cannot be changed', 'QUIZ_ATTEMPT_SUBMITTED')

  const questionsById = new Map(attempt.quiz.questions.map((question) => [question.id, question]))
  if (new Set(input.answers.map((answer) => answer.questionId)).size !== input.answers.length) {
    throw new AppError(400, 'Each question may be answered only once', 'INVALID_QUIZ_ANSWER')
  }
  for (const answer of input.answers) {
    const question = questionsById.get(answer.questionId)
    if (!question || !question.options.some((option) => option.id === answer.optionId)) {
      throw new AppError(400, 'An answer does not belong to this quiz question', 'INVALID_QUIZ_ANSWER')
    }
  }

  const score = calculateQuizScore(attempt.quiz.questions, input.answers)
  const submittedAt = new Date()
  let newlyEarnedBadges = []

  await database.$transaction(async (transaction) => {
    const updated = await transaction.quizAttempt.updateMany({
      where: { id: attemptId, studentId, submittedAt: null },
      data: { score, submittedAt },
    })
    if (updated.count === 0) throw new AppError(409, 'A submitted quiz attempt cannot be changed', 'QUIZ_ATTEMPT_SUBMITTED')

    if (input.answers.length > 0) {
      await transaction.quizAnswer.createMany({
        data: input.answers.map((answer) => ({ attemptId, questionId: answer.questionId, selectedOptionId: answer.optionId })),
      })
    }

    const xpReward = await awardQuizAttemptXp(
      studentId,
      attemptId,
      score,
      transaction,
    )
    const quizBadges = await awardQuizSubmissionBadges(
      studentId,
      attemptId,
      score,
      transaction,
    )
    newlyEarnedBadges = [...xpReward.newlyEarnedBadges, ...quizBadges]
  })

  const result = await getQuizAttemptResult(studentId, attemptId, database)
  return { ...result, newlyEarnedBadges }
}

export const getQuizAttemptResult = async (studentId, attemptId, database = prisma) => {
  const attempt = await findStudentAttempt(studentId, attemptId, database)
  if (!attempt.submittedAt) throw new AppError(409, 'Submit the quiz attempt before viewing its result', 'QUIZ_ATTEMPT_IN_PROGRESS')
  const earnedBadges = await listBadgeAwardsForSource(
    studentId,
    attemptId,
    database,
  )

  const selectedByQuestion = new Map(attempt.answers.map((answer) => [answer.questionId, answer.selectedOptionId]))
  return {
    id: attempt.id,
    quizId: attempt.quizId,
    studentId: attempt.studentId,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    score: attempt.score,
    xpReward: attempt.xpReward
      ? {
          ...attempt.xpReward,
          levelUp:
            attempt.xpReward.levelAfter > attempt.xpReward.levelBefore,
        }
      : null,
    earnedBadges,
    quiz: {
      ...attempt.quiz,
      questions: attempt.quiz.questions.map((question) => ({
        ...question,
        selectedOptionId: selectedByQuestion.get(question.id) ?? null,
      })),
    },
  }
}

export const listStudentQuizAttempts = (studentId, database = prisma) =>
  database.quizAttempt.findMany({
    where: { studentId },
    select: {
      id: true,
      quizId: true,
      startedAt: true,
      submittedAt: true,
      score: true,
      xpReward: { select: xpRewardSelect },
      quiz: { select: { id: true, title: true, course: { select: { id: true, title: true } }, _count: { select: { questions: true } } } },
    },
    orderBy: { startedAt: 'desc' },
  })
