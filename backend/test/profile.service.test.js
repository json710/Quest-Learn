import assert from 'node:assert/strict'
import test from 'node:test'

import {
  changePassword,
  loginUser,
  updateProfile,
} from '../src/services/auth.service.js'
import {
  changePasswordSchema,
  updateProfileSchema,
} from '../src/validation/auth.schemas.js'
import { hashPassword, verifyPassword } from '../src/utils/password.js'

const testSecret = 'test-only-jwt-secret-that-is-at-least-32-characters'

const publicUser = {
  id: 'student_1',
  name: 'Student One',
  email: 'student@example.com',
  role: 'STUDENT',
  isActive: true,
  xp: 100,
  level: 2,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

test('authenticated users can update their own name', async () => {
  const database = {
    user: {
      update: async ({ where, data, select }) => {
        assert.deepEqual(where, { id: 'student_1' })
        assert.deepEqual(data, { name: 'Updated Student' })
        assert.equal(select.password, undefined)
        return { ...publicUser, ...data }
      },
    },
  }

  const user = await updateProfile(
    'student_1',
    { name: 'Updated Student' },
    database,
  )
  assert.equal(user.name, 'Updated Student')
})

test('email updates are normalized and returned safely', async () => {
  const database = {
    user: {
      findUnique: async ({ where }) => {
        assert.deepEqual(where, { email: 'updated@example.com' })
        return null
      },
      update: async ({ data, select }) => {
        assert.deepEqual(data, { email: 'updated@example.com' })
        assert.equal(select.password, undefined)
        return { ...publicUser, ...data }
      },
    },
  }

  const user = await updateProfile(
    'student_1',
    { email: 'UPDATED@example.com' },
    database,
  )
  assert.equal(user.email, 'updated@example.com')
  assert.equal('password' in user, false)
})

test('duplicate profile emails are rejected', async () => {
  let updateWasCalled = false
  const database = {
    user: {
      findUnique: async () => ({ id: 'another_user' }),
      update: async () => { updateWasCalled = true },
    },
  }

  await assert.rejects(
    updateProfile(
      'student_1',
      { email: 'taken@example.com' },
      database,
    ),
    (error) => error.code === 'EMAIL_IN_USE' && error.statusCode === 409,
  )
  assert.equal(updateWasCalled, false)
})

test('profile validation rejects protected account fields', () => {
  for (const field of ['role', 'xp', 'level', 'isActive', 'password']) {
    assert.equal(
      updateProfileSchema.safeParse({ name: 'Valid Name', [field]: 'value' })
        .success,
      false,
    )
  }
})

test('password changes verify the current password and replace its hash', async () => {
  const oldPassword = 'old password value'
  const newPassword = 'new password value'
  const state = {
    ...publicUser,
    password: await hashPassword(oldPassword, 4),
  }
  const database = {
    user: {
      findUnique: async () => ({ ...state }),
      update: async ({ data, select }) => {
        assert.notEqual(data.password, newPassword)
        assert.equal(select.password, undefined)
        state.password = data.password
        return { ...publicUser }
      },
    },
  }

  await assert.rejects(
    changePassword(
      'student_1',
      { currentPassword: 'incorrect password', newPassword },
      database,
    ),
    (error) =>
      error.code === 'CURRENT_PASSWORD_INCORRECT' && error.statusCode === 400,
  )

  const user = await changePassword(
    'student_1',
    { currentPassword: oldPassword, newPassword },
    database,
  )
  assert.equal('password' in user, false)
  assert.equal(await verifyPassword(oldPassword, state.password), false)
  assert.equal(await verifyPassword(newPassword, state.password), true)

  await assert.rejects(
    loginUser(
      { email: state.email, password: oldPassword },
      { database, tokenOptions: { secret: testSecret, expiresIn: '1h' } },
    ),
    (error) => error.code === 'INVALID_CREDENTIALS',
  )
  const login = await loginUser(
    { email: state.email, password: newPassword },
    { database, tokenOptions: { secret: testSecret, expiresIn: '1h' } },
  )
  assert.equal(login.user.id, 'student_1')
})

test('password changes use registration password validation rules', () => {
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: 'current password',
      newPassword: 'short',
    }).success,
    false,
  )
  assert.equal(
    changePasswordSchema.safeParse({
      currentPassword: 'current password',
      newPassword: 'valid new password',
    }).success,
    true,
  )
})
