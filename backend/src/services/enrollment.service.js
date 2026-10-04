import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertEnrollment } from '../utils/course-access.js'
import { courseSummarySelect } from './course.service.js'

const alreadyEnrolledError = () =>
  new AppError(
    409,
    'You are already enrolled in this course',
    'ALREADY_ENROLLED',
  )

export const enrollInCourse = async (
  studentId,
  courseId,
  database = prisma,
) => {
  const course = await database.course.findFirst({
    where: { id: courseId, isPublished: true },
    select: { id: true },
  })

  if (!course) {
    throw new AppError(404, 'Course was not found', 'COURSE_NOT_FOUND')
  }

  const existingEnrollment = await database.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  })

  if (existingEnrollment) throw alreadyEnrolledError()

  try {
    return await database.enrollment.create({
      data: { studentId, courseId },
      select: {
        id: true,
        createdAt: true,
        course: { select: courseSummarySelect },
      },
    })
  } catch (error) {
    if (error?.code === 'P2002') throw alreadyEnrolledError()
    throw error
  }
}

export const listEnrolledCourses = (studentId, database = prisma) =>
  database.enrollment.findMany({
    where: { studentId },
    select: {
      id: true,
      createdAt: true,
      course: { select: courseSummarySelect },
    },
    orderBy: { createdAt: 'desc' },
  })

export const getEnrolledCourseContent = async (
  studentId,
  courseId,
  database = prisma,
) => {
  const course = await database.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  })

  if (!course) {
    throw new AppError(404, 'Course was not found', 'COURSE_NOT_FOUND')
  }

  const enrollment = await database.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { id: true },
  })

  assertEnrollment(enrollment)

  return database.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      description: true,
      instructor: { select: { id: true, name: true } },
      lessons: {
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      },
      learningTasks: {
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      },
    },
  })
}
