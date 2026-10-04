import {
  getAvailableCourse,
  listAvailableCourses,
} from '../services/course.service.js'
import {
  enrollInCourse,
  getEnrolledCourseContent,
  listEnrolledCourses,
} from '../services/enrollment.service.js'

export const browseCourses = async (_request, response) => {
  const courses = await listAvailableCourses()
  return response.json({ data: { courses } })
}

export const viewCourse = async (request, response) => {
  const course = await getAvailableCourse(request.validatedParams.courseId)
  return response.json({ data: { course } })
}

export const enroll = async (request, response) => {
  const enrollment = await enrollInCourse(
    request.user.id,
    request.validatedParams.courseId,
  )
  return response.status(201).json({
    message: 'Enrollment successful',
    data: { enrollment },
  })
}

export const viewEnrolledCourses = async (request, response) => {
  const enrollments = await listEnrolledCourses(request.user.id)
  return response.json({ data: { enrollments } })
}

export const viewLearningContent = async (request, response) => {
  const course = await getEnrolledCourseContent(
    request.user.id,
    request.validatedParams.courseId,
  )
  return response.json({ data: { course } })
}
