import assert from 'node:assert/strict'
import test from 'node:test'

import { authorizeRoles } from '../src/middleware/authorize.middleware.js'

const runMiddleware = (middleware, request) => {
  let nextValue = Symbol('not called')
  middleware(request, {}, (value) => {
    nextValue = value
  })
  return nextValue
}

test('role authorization permits an allowed role', () => {
  const result = runMiddleware(authorizeRoles('INSTRUCTOR', 'ADMIN'), {
    user: { role: 'ADMIN' },
  })

  assert.equal(result, undefined)
})

test('role authorization rejects a disallowed role', () => {
  const error = runMiddleware(authorizeRoles('INSTRUCTOR', 'ADMIN'), {
    user: { role: 'STUDENT' },
  })

  assert.equal(error.statusCode, 403)
  assert.equal(error.code, 'FORBIDDEN')
})

test('role authorization requires authentication first', () => {
  const error = runMiddleware(authorizeRoles('ADMIN'), {})

  assert.equal(error.statusCode, 401)
  assert.equal(error.code, 'AUTHENTICATION_REQUIRED')
})
