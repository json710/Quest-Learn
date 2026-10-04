import assert from 'node:assert/strict'
import test from 'node:test'

import { loginSchema, registerSchema } from '../src/validation/auth.schemas.js'

test('registration validation trims valid input', () => {
  const result = registerSchema.parse({
    name: '  Ada Lovelace  ',
    email: '  ADA@example.com  ',
    password: 'secure-password',
  })

  assert.equal(result.name, 'Ada Lovelace')
  assert.equal(result.email, 'ADA@example.com')
})

test('registration validation rejects invalid and privileged input', () => {
  const result = registerSchema.safeParse({
    name: 'A',
    email: 'not-an-email',
    password: 'short',
    role: 'ADMIN',
  })

  assert.equal(result.success, false)
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'name'))
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'email'))
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'password'))
  assert.ok(result.error.issues.some((issue) => issue.code === 'unrecognized_keys'))
})

test('login validation requires both email and password', () => {
  const result = loginSchema.safeParse({ email: 'student@example.com' })

  assert.equal(result.success, false)
  assert.ok(result.error.issues.some((issue) => issue.path[0] === 'password'))
})
