import { AppError } from './app-error.js'

export const assertCourseOwnership = (course, instructorId) => {
  if (!course) {
    throw new AppError(404, 'Course was not found', 'COURSE_NOT_FOUND')
  }

  if (course.instructorId !== instructorId) {
    throw new AppError(
      403,
      'You can only access resources for courses you own',
      'COURSE_OWNERSHIP_REQUIRED',
    )
  }

  return course
}

export const assertEnrollment = (enrollment) => {
  if (!enrollment) {
    throw new AppError(
      403,
      'You must be enrolled in this course to access this resource',
      'ENROLLMENT_REQUIRED',
    )
  }

  return enrollment
}
