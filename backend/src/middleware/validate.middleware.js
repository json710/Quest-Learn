import { AppError } from '../utils/app-error.js'

const validateRequestPart = (schema, source, destination) =>
  (request, _response, next) => {
    const result = schema.safeParse(request[source])

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }))

      return next(
        new AppError(
          400,
          'Request validation failed',
          'VALIDATION_ERROR',
          details,
        ),
      )
    }

    request[destination] = result.data
    return next()
  }

export const validateBody = (schema) =>
  validateRequestPart(schema, 'body', 'validatedBody')

export const validateParams = (schema) =>
  validateRequestPart(schema, 'params', 'validatedParams')

export const validateQuery = (schema) =>
  validateRequestPart(schema, 'query', 'validatedQuery')
