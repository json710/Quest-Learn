import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertCourseOwnership } from '../utils/course-access.js'
import { requireOwnedCourse } from './course.service.js'

const orderedContent = [{ position: 'asc' }, { createdAt: 'asc' }]

const requireOwnedLesson = async (
  lessonId,
  instructorId,
  database = prisma,
) => {
  const lesson = await database.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      course: { select: { instructorId: true } },
    },
  })

  if (!lesson) {
    throw new AppError(404, 'Lesson was not found', 'LESSON_NOT_FOUND')
  }

  assertCourseOwnership(
    { instructorId: lesson.course.instructorId },
    instructorId,
  )
  return lesson
}

const requireOwnedLearningTask = async (
  taskId,
  instructorId,
  database = prisma,
) => {
  const task = await database.learningTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      course: { select: { instructorId: true } },
    },
  })

  if (!task) {
    throw new AppError(
      404,
      'Learning task was not found',
      'LEARNING_TASK_NOT_FOUND',
    )
  }

  assertCourseOwnership(
    { instructorId: task.course.instructorId },
    instructorId,
  )
  return task
}

export const createLesson = async (
  courseId,
  instructorId,
  input,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  return database.lesson.create({ data: { ...input, courseId } })
}

export const listLessons = async (
  courseId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  return database.lesson.findMany({
    where: { courseId },
    orderBy: orderedContent,
  })
}

export const getLesson = async (
  lessonId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedLesson(lessonId, instructorId, database)
  return database.lesson.findUnique({ where: { id: lessonId } })
}

export const updateLesson = async (
  lessonId,
  instructorId,
  input,
  database = prisma,
) => {
  await requireOwnedLesson(lessonId, instructorId, database)
  return database.lesson.update({ where: { id: lessonId }, data: input })
}

export const deleteLesson = async (
  lessonId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedLesson(lessonId, instructorId, database)
  await database.lesson.delete({ where: { id: lessonId } })
}

export const createLearningTask = async (
  courseId,
  instructorId,
  input,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  return database.learningTask.create({ data: { ...input, courseId } })
}

export const listLearningTasks = async (
  courseId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedCourse(courseId, instructorId, database)

  return database.learningTask.findMany({
    where: { courseId },
    orderBy: orderedContent,
  })
}

export const getLearningTask = async (
  taskId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedLearningTask(taskId, instructorId, database)
  return database.learningTask.findUnique({ where: { id: taskId } })
}

export const updateLearningTask = async (
  taskId,
  instructorId,
  input,
  database = prisma,
) => {
  await requireOwnedLearningTask(taskId, instructorId, database)
  return database.learningTask.update({
    where: { id: taskId },
    data: input,
  })
}

export const deleteLearningTask = async (
  taskId,
  instructorId,
  database = prisma,
) => {
  await requireOwnedLearningTask(taskId, instructorId, database)
  await database.learningTask.delete({ where: { id: taskId } })
}
