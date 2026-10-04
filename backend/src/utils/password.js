import bcrypt from 'bcrypt'

import { getEnvironment } from '../config/env.js'

export const hashPassword = (password, saltRounds) =>
  bcrypt.hash(password, saltRounds ?? getEnvironment().bcryptSaltRounds)

export const verifyPassword = (password, passwordHash) =>
  bcrypt.compare(password, passwordHash)
