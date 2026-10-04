import assert from 'node:assert/strict'
import test from 'node:test'

import { loginUser } from '../src/services/auth.service.js'
import { hashPassword } from '../src/utils/password.js'
import { verifyAccessToken } from '../src/utils/token.js'

const testSecret = 'test-only-jwt-secret-that-is-at-least-32-characters'

test('an instructor logs in with the role stored by Prisma', async () => {
  const password = 'correct horse battery staple'
  const databaseUser = {
    id: 'instructor_123',
    name: 'Test Instructor',
    email: 'instructor@test.com',
    password: await hashPassword(password, 4),
    role: 'INSTRUCTOR',
    xp: 0,
    level: 1,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  }

  const database = {
    user: {
      findUnique: async (query) => {
        assert.deepEqual(query.where, { email: 'instructor@test.com' })
        assert.equal(query.select.role, true)
        assert.equal(query.select.password, true)
        return databaseUser
      },
    },
  }

  const result = await loginUser(
    { email: 'INSTRUCTOR@test.com', password },
    {
      database,
      tokenOptions: { secret: testSecret, expiresIn: '1h' },
    },
  )

  assert.equal(result.user.role, 'INSTRUCTOR')
  assert.equal('password' in result.user, false)
  assert.equal(
    verifyAccessToken(result.token, { secret: testSecret }).role,
    'INSTRUCTOR',
  )
})
