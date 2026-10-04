import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { createAccessToken } from '../utils/token.js'
import { publicUserSelect, toPublicUser } from '../utils/user.js'

const emailInUseError = () =>
  new AppError(
    409,
    'A user with that email already exists',
    'EMAIL_IN_USE',
  )

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingUser) {
    throw emailInUseError()
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: passwordHash,
    },
    select: publicUserSelect,
  })

  return {
    user,
    token: createAccessToken(user),
  }
}

export const updateProfile = async (
  userId,
  { name, email },
  database = prisma,
) => {
  const data = {}
  if (name !== undefined) data.name = name

  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase()
    const existingUser = await database.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    })
    if (existingUser && existingUser.id !== userId) {
      throw emailInUseError()
    }
    data.email = normalizedEmail
  }

  try {
    return await database.user.update({
      where: { id: userId },
      data,
      select: publicUserSelect,
    })
  } catch (error) {
    if (error?.code === 'P2002') throw emailInUseError()
    throw error
  }
}

export const changePassword = async (
  userId,
  { currentPassword, newPassword },
  database = prisma,
) => {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  })

  if (!user) {
    throw new AppError(404, 'User was not found', 'USER_NOT_FOUND')
  }

  if (!(await verifyPassword(currentPassword, user.password))) {
    throw new AppError(
      400,
      'Current password is incorrect',
      'CURRENT_PASSWORD_INCORRECT',
    )
  }

  const passwordHash = await hashPassword(newPassword)
  return database.user.update({
    where: { id: userId },
    data: { password: passwordHash },
    select: publicUserSelect,
  })
}

export const loginUser = async (
  { email, password },
  { database = prisma, tokenOptions } = {},
) => {
  const user = await database.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      ...publicUserSelect,
      password: true,
    },
  })
  const passwordIsValid = user
    ? await verifyPassword(password, user.password)
    : false

  if (!user || !passwordIsValid) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS')
  }

  if (user.isActive === false) {
    throw new AppError(
      403,
      'This account has been deactivated',
      'ACCOUNT_INACTIVE',
    )
  }

  const publicUser = toPublicUser(user)

  return {
    user: publicUser,
    token: createAccessToken(publicUser, tokenOptions),
  }
}
