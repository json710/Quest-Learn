import jwt from 'jsonwebtoken'

import { getEnvironment } from '../config/env.js'

const tokenOptions = {
  audience: 'questlearn-client',
  issuer: 'questlearn-api',
}

export const createAccessToken = (user, options = {}) => {
  const env = getEnvironment()
  const secret = options.secret ?? env.jwtSecret

  if (!secret) throw new Error('JWT_SECRET is required to create access tokens')

  return jwt.sign({ role: user.role }, secret, {
    ...tokenOptions,
    expiresIn: options.expiresIn ?? env.jwtExpiresIn,
    subject: user.id,
  })
}

export const verifyAccessToken = (token, options = {}) => {
  const secret = options.secret ?? getEnvironment().jwtSecret

  if (!secret) throw new Error('JWT_SECRET is required to verify access tokens')

  return jwt.verify(token, secret, tokenOptions)
}
