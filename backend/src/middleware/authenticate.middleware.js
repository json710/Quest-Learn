import jwt from 'jsonwebtoken'

import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { asyncHandler } from '../utils/async-handler.js'
import { verifyAccessToken } from '../utils/token.js'
import { publicUserSelect } from '../utils/user.js'

export const authenticate = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)

  if (!match) {
    throw new AppError(
      401,
      'A Bearer access token is required',
      'AUTHENTICATION_REQUIRED',
    )
  }

  let payload

  try {
    payload = verifyAccessToken(match[1])
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Access token has expired', 'TOKEN_EXPIRED')
    }

    throw new AppError(401, 'Access token is invalid', 'INVALID_TOKEN')
  }

  if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
    throw new AppError(401, 'Access token is invalid', 'INVALID_TOKEN')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: publicUserSelect,
  })

  if (!user) {
    throw new AppError(401, 'The authenticated user no longer exists', 'INVALID_TOKEN')
  }

  if (user.isActive === false) {
    throw new AppError(
      401,
      'This account has been deactivated',
      'ACCOUNT_INACTIVE',
    )
  }

  request.user = user
  next()
})
