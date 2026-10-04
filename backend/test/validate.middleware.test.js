import assert from 'node:assert/strict'
import test from 'node:test'

import { validateBody } from '../src/middleware/validate.middleware.js'
import { registerSchema } from '../src/validation/auth.schemas.js'

test('body validation returns field-level error details', () => {
  const request = {
    body: { name: '', email: 'invalid', password: 'short' },
  }
  let validationError

  validateBody(registerSchema)(request, {}, (error) => {
    validationError = error
  })

  assert.equal(validationError.statusCode, 400)
  assert.equal(validationError.code, 'VALIDATION_ERROR')
  assert.ok(
    validationError.details.some(
      (detail) => detail.field === 'email' && detail.message.includes('valid'),
    ),
  )
})
