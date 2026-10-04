import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'

const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  xp: true,
  level: true,
  createdAt: true,
  updatedAt: true,
}

const adminUserDetailSelect = {
  ...adminUserSelect,
  _count: {
    select: {
      taughtCourses: true,
      enrollments: true,
      submissions: true,
      quizAttempts: true,
      badges: true,
    },
  },
}

const userNotFound = () =>
  new AppError(404, 'User was not found', 'USER_NOT_FOUND')

export const listAdminUsers = async (
  { page, limit, role, status, search },
  database = prisma,
) => {
  const where = {
    ...(role ? { role } : {}),
    ...(status ? { isActive: status === 'ACTIVE' } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [users, total] = await Promise.all([
    database.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    database.user.count({ where }),
  ])

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  }
}

export const getAdminUser = async (userId, database = prisma) => {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: adminUserDetailSelect,
  })
  if (!user) throw userNotFound()
  return user
}

export const updateAdminUserRole = async (
  adminId,
  userId,
  role,
  database = prisma,
) => {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })
  if (!user) throw userNotFound()

  if (userId === adminId && role !== 'ADMIN') {
    throw new AppError(
      409,
      'You cannot remove your own administrator access',
      'SELF_ADMIN_ROLE_CHANGE',
    )
  }

  return database.user.update({
    where: { id: userId },
    data: { role },
    select: adminUserSelect,
  })
}

export const updateAdminUserStatus = async (
  adminId,
  userId,
  isActive,
  database = prisma,
) => {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true },
  })
  if (!user) throw userNotFound()

  if (userId === adminId && !isActive) {
    throw new AppError(
      409,
      'You cannot deactivate your own account',
      'SELF_DEACTIVATION',
    )
  }

  return database.user.update({
    where: { id: userId },
    data: { isActive },
    select: adminUserSelect,
  })
}

export const getAdminOverview = async (database = prisma) => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    totalQuizzes,
    totalQuizAttempts,
    totalTaskSubmissions,
  ] = await Promise.all([
    database.user.count(),
    database.user.count({ where: { role: 'STUDENT' } }),
    database.user.count({ where: { role: 'INSTRUCTOR' } }),
    database.course.count(),
    database.enrollment.count(),
    database.quiz.count(),
    database.quizAttempt.count(),
    database.submission.count(),
  ])

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    totalEnrollments,
    totalQuizzes,
    totalQuizAttempts,
    totalTaskSubmissions,
  }
}
