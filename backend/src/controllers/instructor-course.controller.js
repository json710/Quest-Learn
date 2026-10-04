import {
  createLearningTask as createLearningTaskService,
  createLesson as createLessonService,
  deleteLearningTask as deleteLearningTaskService,
  deleteLesson as deleteLessonService,
  getLearningTask as getLearningTaskService,
  getLesson as getLessonService,
  listLearningTasks as listLearningTasksService,
  listLessons as listLessonsService,
  updateLearningTask as updateLearningTaskService,
  updateLesson as updateLessonService,
} from '../services/course-content.service.js'
import {
  createCourse as createCourseService,
  deleteCourse as deleteCourseService,
  getInstructorCourse,
  listInstructorCourses,
  updateCourse as updateCourseService,
} from '../services/course.service.js'

export const createCourse = async (request, response) => {
  const course = await createCourseService(request.user.id, request.validatedBody)
  return response.status(201).json({ data: { course } })
}

export const listCourses = async (request, response) => {
  const courses = await listInstructorCourses(request.user.id)
  return response.json({ data: { courses } })
}

export const getCourse = async (request, response) => {
  const course = await getInstructorCourse(
    request.validatedParams.courseId,
    request.user.id,
  )
  return response.json({ data: { course } })
}

export const updateCourse = async (request, response) => {
  const course = await updateCourseService(
    request.validatedParams.courseId,
    request.user.id,
    request.validatedBody,
  )
  return response.json({ data: { course } })
}

export const deleteCourse = async (request, response) => {
  await deleteCourseService(request.validatedParams.courseId, request.user.id)
  return response.status(204).send()
}

export const createLesson = async (request, response) => {
  const lesson = await createLessonService(
    request.validatedParams.courseId,
    request.user.id,
    request.validatedBody,
  )
  return response.status(201).json({ data: { lesson } })
}

export const listLessons = async (request, response) => {
  const lessons = await listLessonsService(
    request.validatedParams.courseId,
    request.user.id,
  )
  return response.json({ data: { lessons } })
}

export const getLesson = async (request, response) => {
  const lesson = await getLessonService(
    request.validatedParams.lessonId,
    request.user.id,
  )
  return response.json({ data: { lesson } })
}

export const updateLesson = async (request, response) => {
  const lesson = await updateLessonService(
    request.validatedParams.lessonId,
    request.user.id,
    request.validatedBody,
  )
  return response.json({ data: { lesson } })
}

export const deleteLesson = async (request, response) => {
  await deleteLessonService(request.validatedParams.lessonId, request.user.id)
  return response.status(204).send()
}

export const createLearningTask = async (request, response) => {
  const learningTask = await createLearningTaskService(
    request.validatedParams.courseId,
    request.user.id,
    request.validatedBody,
  )
  return response.status(201).json({ data: { learningTask } })
}

export const listLearningTasks = async (request, response) => {
  const learningTasks = await listLearningTasksService(
    request.validatedParams.courseId,
    request.user.id,
  )
  return response.json({ data: { learningTasks } })
}

export const getLearningTask = async (request, response) => {
  const learningTask = await getLearningTaskService(
    request.validatedParams.taskId,
    request.user.id,
  )
  return response.json({ data: { learningTask } })
}

export const updateLearningTask = async (request, response) => {
  const learningTask = await updateLearningTaskService(
    request.validatedParams.taskId,
    request.user.id,
    request.validatedBody,
  )
  return response.json({ data: { learningTask } })
}

export const deleteLearningTask = async (request, response) => {
  await deleteLearningTaskService(
    request.validatedParams.taskId,
    request.user.id,
  )
  return response.status(204).send()
}
