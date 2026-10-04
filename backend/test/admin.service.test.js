import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getAdminOverview,
  getAdminUser,
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../src/services/admin.service.js'
import { loginUser } from '../src/services/auth.service.js'
import { authorizeRoles } from '../src/middleware/authorize.middleware.js'
import {
  adminUserListQuerySchema,
  updateUserRoleSchema,
} from '../src/validation/admin.schemas.js'
import { hashPassword } from '../src/utils/password.js'

const safeUser = {
  id: 'student_1',
  name: 'Student One',
  email: 'student@example.com',
  role: 'STUDENT',
  isActive: true,
  xp: 120,
  level: 2,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

test('admin-only authorization permits ADMIN and denies student and instructor roles', () => {
  const middleware = authorizeRoles('ADMIN')
  assert.equal(runMiddleware(middleware, { user: { role: 'ADMIN' } }), undefined)

  for (const role of ['STUDENT', 'INSTRUCTOR']) {
    const error = runMiddleware(middleware, { user: { role } })
    assert.equal(error.statusCode, 403)
    assert.equal(error.code, 'FORBIDDEN')
  }
})

test('user directory applies pagination and role filtering without passwords', async () => {
  const database = {
    user: {
      findMany: async (query) => {
        assert.deepEqual(query.where, { role: 'STUDENT' })
        assert.equal(query.skip, 20)
        assert.equal(query.take, 20)
        assert.equal(query.select.password, undefined)
        return [safeUser]
      },
      count: async ({ where }) => {
        assert.deepEqual(where, { role: 'STUDENT' })
        return 21
      },
    },
  }

  const result = await listAdminUsers(
    { page: 2, limit: 20, role: 'STUDENT' },
    database,
  )
  assert.equal(result.pagination.totalPages, 2)
  assert.equal('password' in result.users[0], false)
})

test('admin user details never select or return password hashes', async () => {
  const database = {
    user: {
      findUnique: async ({ select }) => {
        assert.equal(select.password, undefined)
        return { ...safeUser, _count: { badges: 1 } }
      },
    },
  }

  const user = await getAdminUser('student_1', database)
  assert.equal('password' in user, false)
})

test('missing admin user lookups return a clear not-found error', async () => {
  const database = {
    user: { findUnique: async () => null },
  }

  await assert.rejects(
    getAdminUser('missing_user', database),
    (error) => error.code === 'USER_NOT_FOUND' && error.statusCode === 404,
  )
})

test('role updates work and invalid roles are rejected by validation', async () => {
  const database = {
    user: {
      findUnique: async () => ({ id: 'student_1', role: 'STUDENT' }),
      update: async ({ data, select }) => {
        assert.deepEqual(data, { role: 'INSTRUCTOR' })
        assert.equal(select.password, undefined)
        return { ...safeUser, role: data.role }
      },
    },
  }

  const user = await updateAdminUserRole(
    'admin_1',
    'student_1',
    'INSTRUCTOR',
    database,
  )
  assert.equal(user.role, 'INSTRUCTOR')
  assert.equal(updateUserRoleSchema.safeParse({ role: 'OWNER' }).success, false)
})

test('admins cannot demote or deactivate themselves', async () => {
  const database = {
    user: {
      findUnique: async () => ({ id: 'admin_1', role: 'ADMIN', isActive: true }),
    },
  }

  await assert.rejects(
    updateAdminUserRole('admin_1', 'admin_1', 'STUDENT', database),
    (error) => error.code === 'SELF_ADMIN_ROLE_CHANGE' && error.statusCode === 409,
  )
  await assert.rejects(
    updateAdminUserStatus('admin_1', 'admin_1', false, database),
    (error) => error.code === 'SELF_DEACTIVATION' && error.statusCode === 409,
  )
})

test('admins can deactivate and reactivate another user without deleting data', async () => {
  const updates = []
  const database = {
    user: {
      findUnique: async () => ({ id: 'student_1', isActive: true }),
      update: async ({ data, select }) => {
        assert.equal(select.password, undefined)
        updates.push(data.isActive)
        return { ...safeUser, isActive: data.isActive }
      },
    },
  }

  const inactive = await updateAdminUserStatus(
    'admin_1',
    'student_1',
    false,
    database,
  )
  const active = await updateAdminUserStatus(
    'admin_1',
    'student_1',
    true,
    database,
  )

  assert.equal(inactive.isActive, false)
  assert.equal(active.isActive, true)
  assert.deepEqual(updates, [false, true])
})

test('inactive users cannot log in with otherwise valid credentials', async () => {
  const password = 'correct horse battery staple'
  const database = {
    user: {
      findUnique: async () => ({
        ...safeUser,
        password: await hashPassword(password, 4),
        isActive: false,
      }),
    },
  }

  await assert.rejects(
    loginUser({ email: safeUser.email, password }, { database }),
    (error) => error.code === 'ACCOUNT_INACTIVE' && error.statusCode === 403,
  )
})

test('system overview totals are returned correctly', async () => {
  const userCounts = [12, 9, 2]
  const database = {
    user: { count: async () => userCounts.shift() },
    course: { count: async () => 4 },
    enrollment: { count: async () => 16 },
    quiz: { count: async () => 7 },
    quizAttempt: { count: async () => 23 },
    submission: { count: async () => 19 },
  }

  assert.deepEqual(await getAdminOverview(database), {
    totalUsers: 12,
    totalStudents: 9,
    totalInstructors: 2,
    totalCourses: 4,
    totalEnrollments: 16,
    totalQuizzes: 7,
    totalQuizAttempts: 23,
    totalTaskSubmissions: 19,
  })
})

test('admin list query applies safe defaults', () => {
  const result = adminUserListQuerySchema.parse({})
  assert.deepEqual(result, { page: 1, limit: 20 })
})

function runMiddleware(middleware, request) {
  let nextValue = Symbol('not called')
  middleware(request, {}, (value) => {
    nextValue = value
  })
  return nextValue
}
