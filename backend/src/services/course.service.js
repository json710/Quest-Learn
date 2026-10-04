import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertCourseOwnership } from '../utils/course-access.js'

const instructorSelect = {
  id: true,
  name: true,
}

export const courseSummarySelect = {
  id: true,
  title: true,
  description: true,
  isPublished: true,
  instructorId: true,
  createdAt: true,
  updatedAt: true,
  instructor: { select: instructorSelect },
  _count: {
    select: {
      enrollments: true,
      lessons: true,
      learningTasks: true,
    },
  },
}

const instructorCourseDetailSelect = {
  ...courseSummarySelect,
  lessons: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
  learningTasks: { orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] },
}

export const requireOwnedCourse = async (
  courseId,
  instructorId,
  database = prisma,
) => {
  const course = await database.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  })

  return assertCourseOwnership(course, instructorId)
}

export const createCourse = (instructorId, input, database = prisma) =>
  database.course.create({
    data: { ...input, instructorId },
    select: courseSummarySelect,
  })

export const listInstructorCourses = (
  instructorId,
  database = prisma,
) =>
  database.course.findMany({
    where: { instructorId },
    select: courseSummarySelect,
    orderBy: { createdAt: 'desc' },
  })

export const getInstructorCourse = async (
  courseId,
  instructorId,
  database = prisma,
) => {
  const course = await database.course.findUnique({
    where: { id: courseId },
    select: instructorCourseDetailSelect,
  })

  return assertCourseOwnership(course, instructorId)
}

export const updateCourse = async (
  courseId,
  instructorId,
  input,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  return database.course.update({
    where: { id: courseId },
    data: input,
    select: courseSummarySelect,
  })
}

export const deleteCourse = async (
  courseId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  try {
    await database.course.delete({ where: { id: courseId } })
  } catch (error) {
    if (error?.code === 'P2025') {
      throw new AppError(404, 'Course was not found', 'COURSE_NOT_FOUND')
    }
    throw error
  }
}

export const listAvailableCourses = (database = prisma) =>
  database.course.findMany({
    where: { isPublished: true },
    select: courseSummarySelect,
    orderBy: { createdAt: 'desc' },
  })

export const getAvailableCourse = async (courseId, database = prisma) => {
  const course = await database.course.findFirst({
    where: { id: courseId, isPublished: true },
    select: courseSummarySelect,
  })

  if (!course) {
    throw new AppError(404, 'Course was not found', 'COURSE_NOT_FOUND')
  }

  return course
}
