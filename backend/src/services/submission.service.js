import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import {
  assertCourseOwnership,
  assertEnrollment,
} from '../utils/course-access.js'
import {
  awardTaskReviewBadges,
  listBadgeAwardsForSource,
  listBadgeAwardsForSources,
} from './badge.service.js'
import { awardTaskReviewXp } from './gamification.service.js'

const xpRewardSelect = {
  amount: true,
  xpAfter: true,
  levelBefore: true,
  levelAfter: true,
}

const submissionExistsError = () =>
  new AppError(
    409,
    'A submission already exists for this learning task',
    'SUBMISSION_EXISTS',
  )

const reviewedSubmissionError = () =>
  new AppError(
    409,
    'Reviewed submissions can no longer be updated by students',
    'SUBMISSION_ALREADY_REVIEWED',
  )

const submissionDetailSelect = {
  id: true,
  content: true,
  status: true,
  score: true,
  feedback: true,
  studentId: true,
  learningTaskId: true,
  submittedAt: true,
  reviewedAt: true,
  updatedAt: true,
  xpReward: { select: xpRewardSelect },
  student: {
    select: { id: true, name: true, email: true },
  },
  learningTask: {
    select: {
      id: true,
      title: true,
      course: {
        select: { id: true, title: true, instructorId: true },
      },
    },
  },
}

const requireOwnedLearningTask = async (
  taskId,
  instructorId,
  database = prisma,
) => {
  const learningTask = await database.learningTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      course: { select: { instructorId: true } },
    },
  })

  if (!learningTask) {
    throw new AppError(
      404,
      'Learning task was not found',
      'LEARNING_TASK_NOT_FOUND',
    )
  }

  assertCourseOwnership(
    { instructorId: learningTask.course.instructorId },
    instructorId,
  )
  return learningTask
}

const requireInstructorSubmission = async (
  submissionId,
  instructorId,
  database = prisma,
) => {
  const submission = await database.submission.findUnique({
    where: { id: submissionId },
    select: submissionDetailSelect,
  })

  if (!submission) {
    throw new AppError(
      404,
      'Submission was not found',
      'SUBMISSION_NOT_FOUND',
    )
  }

  assertCourseOwnership(
    { instructorId: submission.learningTask.course.instructorId },
    instructorId,
  )
  return submission
}

export const submitWork = async (
  studentId,
  taskId,
  { content },
  database = prisma,
) => {
  const learningTask = await database.learningTask.findUnique({
    where: { id: taskId },
    select: { id: true, courseId: true },
  })

  if (!learningTask) {
    throw new AppError(
      404,
      'Learning task was not found',
      'LEARNING_TASK_NOT_FOUND',
    )
  }

  const enrollment = await database.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId: learningTask.courseId,
      },
    },
    select: { id: true },
  })

  assertEnrollment(enrollment)

  const existingSubmission = await database.submission.findUnique({
    where: { studentId_learningTaskId: { studentId, learningTaskId: taskId } },
    select: { id: true },
  })

  if (existingSubmission) throw submissionExistsError()

  try {
    return await database.submission.create({
      data: { content, studentId, learningTaskId: taskId },
      select: submissionDetailSelect,
    })
  } catch (error) {
    if (error?.code === 'P2002') throw submissionExistsError()
    throw error
  }
}

export const updateStudentSubmission = async (
  studentId,
  submissionId,
  { content },
  database = prisma,
) => {
  const submission = await database.submission.findUnique({
    where: { id: submissionId },
    select: { id: true, studentId: true, status: true },
  })

  if (!submission) {
    throw new AppError(
      404,
      'Submission was not found',
      'SUBMISSION_NOT_FOUND',
    )
  }

  if (submission.studentId !== studentId) {
    throw new AppError(
      403,
      'You can only update your own submissions',
      'SUBMISSION_OWNERSHIP_REQUIRED',
    )
  }

  if (submission.status === 'REVIEWED') throw reviewedSubmissionError()

  const update = await database.submission.updateMany({
    where: { id: submissionId, studentId, status: 'SUBMITTED' },
    data: { content },
  })

  if (update.count === 0) throw reviewedSubmissionError()

  return database.submission.findUnique({
    where: { id: submissionId },
    select: submissionDetailSelect,
  })
}

export const getStudentSubmissionForTask = async (
  studentId,
  taskId,
  database = prisma,
) => {
  const submission = await database.submission.findUnique({
    where: { studentId_learningTaskId: { studentId, learningTaskId: taskId } },
    select: submissionDetailSelect,
  })

  if (!submission) {
    throw new AppError(
      404,
      'Submission was not found',
      'SUBMISSION_NOT_FOUND',
    )
  }

  const earnedBadges = await listBadgeAwardsForSource(
    studentId,
    submission.id,
    database,
  )

  return { ...submission, earnedBadges }
}

export const listStudentSubmissions = async (studentId, database = prisma) => {
  const submissions = await database.submission.findMany({
    where: { studentId },
    select: submissionDetailSelect,
    orderBy: { submittedAt: 'desc' },
  })
  const earnedBadges = await listBadgeAwardsForSources(
    studentId,
    submissions.map((submission) => submission.id),
    database,
  )
  const badgesBySource = new Map()
  for (const achievement of earnedBadges) {
    const sourceBadges = badgesBySource.get(achievement.sourceId) ?? []
    sourceBadges.push(achievement)
    badgesBySource.set(achievement.sourceId, sourceBadges)
  }

  return submissions.map((submission) => ({
    ...submission,
    earnedBadges: badgesBySource.get(submission.id) ?? [],
  }))
}

export const listTaskSubmissions = async (
  instructorId,
  taskId,
  database = prisma,
) => {
  await requireOwnedLearningTask(taskId, instructorId, database)

  return database.submission.findMany({
    where: { learningTaskId: taskId },
    select: submissionDetailSelect,
    orderBy: { submittedAt: 'desc' },
  })
}

export const getInstructorSubmission = (
  instructorId,
  submissionId,
  database = prisma,
) => requireInstructorSubmission(submissionId, instructorId, database)

export const reviewSubmission = async (
  instructorId,
  submissionId,
  { score, feedback },
  database = prisma,
) => {
  const existingSubmission = await requireInstructorSubmission(
    submissionId,
    instructorId,
    database,
  )

  return database.$transaction(async (transaction) => {
    const reviewData = {
      status: 'REVIEWED',
      score,
      feedback,
      reviewedAt: new Date(),
    }
    const firstReview = await transaction.submission.updateMany({
      where: { id: submissionId, status: 'SUBMITTED' },
      data: reviewData,
    })

    let newlyEarnedBadges = []

    if (firstReview.count === 1) {
      const xpReward = await awardTaskReviewXp(
        existingSubmission.studentId,
        submissionId,
        transaction,
      )
      const taskBadges = await awardTaskReviewBadges(
        existingSubmission.studentId,
        submissionId,
        transaction,
      )
      newlyEarnedBadges = [...xpReward.newlyEarnedBadges, ...taskBadges]
    } else {
      await transaction.submission.update({
        where: { id: submissionId },
        data: reviewData,
      })
    }

    const submission = await transaction.submission.findUnique({
      where: { id: submissionId },
      select: submissionDetailSelect,
    })

    return { ...submission, newlyEarnedBadges }
  })
}
