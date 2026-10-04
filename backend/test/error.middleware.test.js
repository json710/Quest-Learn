import assert from 'node:assert/strict'
import test from 'node:test'

import { errorHandler } from '../src/middleware/error.middleware.js'

test('malformed JSON receives a clear 400 response', () => {
  const response = {
    headersSent: false,
    statusCode: undefined,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }

  errorHandler(
    { type: 'entity.parse.failed' },
    {},
    response,
    () => assert.fail('next should not be called'),
  )

  assert.equal(response.statusCode, 400)
  assert.deepEqual(response.body, {
    error: {
      code: 'INVALID_JSON',
      message: 'Request body contains invalid JSON',
    },
  })
})
