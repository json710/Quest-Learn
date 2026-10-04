import { AppError } from '../utils/app-error.js'

export const authorizeRoles = (...roles) => (request, _response, next) => {
  if (!request.user) {
    return next(
      new AppError(401, 'Authentication is required', 'AUTHENTICATION_REQUIRED'),
    )
  }

  if (!roles.includes(request.user.role)) {
    return next(
      new AppError(
        403,
        'You do not have permission to access this resource',
        'FORBIDDEN',
      ),
    )
  }

  return next()
}
