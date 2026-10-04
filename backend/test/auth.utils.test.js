import assert from 'node:assert/strict'
import test from 'node:test'

import { hashPassword, verifyPassword } from '../src/utils/password.js'
import { createAccessToken, verifyAccessToken } from '../src/utils/token.js'
import { toPublicUser } from '../src/utils/user.js'

const testSecret = 'test-only-jwt-secret-that-is-at-least-32-characters'

test('password helpers hash and verify passwords', async () => {
  const passwordHash = await hashPassword('correct horse battery staple', 4)

  assert.notEqual(passwordHash, 'correct horse battery staple')
  assert.equal(
    await verifyPassword('correct horse battery staple', passwordHash),
    true,
  )
  assert.equal(await verifyPassword('incorrect password', passwordHash), false)
})

test('token helpers issue and verify a scoped access token', () => {
  const token = createAccessToken(
    { id: 'user_123', role: 'STUDENT' },
    { secret: testSecret, expiresIn: '1h' },
  )
  const payload = verifyAccessToken(token, { secret: testSecret })

  assert.equal(payload.sub, 'user_123')
  assert.equal(payload.role, 'STUDENT')
  assert.equal(payload.iss, 'questlearn-api')
  assert.equal(payload.aud, 'questlearn-client')
})

test('public user serialization removes the password hash', () => {
  const user = toPublicUser({
    id: 'user_123',
    name: 'Ada',
    password: 'hashed-password',
    role: 'STUDENT',
  })

  assert.deepEqual(user, {
    id: 'user_123',
    name: 'Ada',
    role: 'STUDENT',
  })
})
