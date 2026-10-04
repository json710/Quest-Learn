import { AppError } from '../utils/app-error.js'

export const notFound = (request, _response, next) => {
  next(
    new AppError(
      404,
      `Route ${request.method} ${request.originalUrl} was not found`,
      'NOT_FOUND',
    ),
  )
}

export const errorHandler = (error, _request, response, next) => {
  if (response.headersSent) return next(error)

  let normalizedError = error

  if (error?.type === 'entity.parse.failed') {
    normalizedError = new AppError(
      400,
      'Request body contains invalid JSON',
      'INVALID_JSON',
    )
  } else if (error?.type === 'entity.too.large') {
    normalizedError = new AppError(
      413,
      'Request body is too large',
      'PAYLOAD_TOO_LARGE',
    )
  } else if (error?.code === 'P2002') {
    const targets = Array.isArray(error.meta?.target) ? error.meta.target : []

    if (targets.includes('email')) {
      normalizedError = new AppError(
        409,
        'A user with that email already exists',
        'EMAIL_IN_USE',
      )
    } else if (
      targets.includes('studentId') &&
      targets.includes('courseId')
    ) {
      normalizedError = new AppError(
        409,
        'You are already enrolled in this course',
        'ALREADY_ENROLLED',
      )
    } else if (
      targets.includes('studentId') &&
      targets.includes('learningTaskId')
    ) {
      normalizedError = new AppError(
        409,
        'A submission already exists for this learning task',
        'SUBMISSION_EXISTS',
      )
    } else {
      normalizedError = new AppError(
        409,
        'A record with those values already exists',
        'UNIQUE_CONSTRAINT_VIOLATION',
      )
    }
  } else if (error?.code === 'P2025') {
    normalizedError = new AppError(
      404,
      'The requested resource was not found',
      'RESOURCE_NOT_FOUND',
    )
  }

  const isOperational = normalizedError instanceof AppError
  const statusCode = isOperational ? normalizedError.statusCode : 500
  const body = {
    error: {
      code: isOperational ? normalizedError.code : 'INTERNAL_SERVER_ERROR',
      message: isOperational
        ? normalizedError.message
        : 'An unexpected error occurred',
    },
  }

  if (isOperational && normalizedError.details) {
    body.error.details = normalizedError.details
  }

  if (!isOperational) console.error(normalizedError)

  return response.status(statusCode).json(body)
}
