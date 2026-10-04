import {
  getInstructorAnalytics,
  getInstructorCourseAnalytics,
  getStudentAnalytics,
} from '../services/analytics.service.js'

export const studentAnalytics = async (request, response) => {
  const analytics = await getStudentAnalytics(request.user.id)
  return response.json({ data: analytics })
}

export const instructorAnalytics = async (request, response) => {
  const analytics = await getInstructorAnalytics(request.user.id)
  return response.json({ data: analytics })
}

export const instructorCourseAnalytics = async (request, response) => {
  const analytics = await getInstructorCourseAnalytics(
    request.user.id,
    request.validatedParams.courseId,
  )
  return response.json({ data: analytics })
}
