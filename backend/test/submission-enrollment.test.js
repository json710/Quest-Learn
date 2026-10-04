import assert from 'node:assert/strict'
import test from 'node:test'

import { submitWork } from '../src/services/submission.service.js'

test('students cannot submit work without a course enrollment', async () => {
  let submissionWasQueried = false
  const database = {
    learningTask: {
      findUnique: async () => ({ id: 'task_1', courseId: 'course_1' }),
    },
    enrollment: { findUnique: async () => null },
    submission: {
      findUnique: async () => {
        submissionWasQueried = true
      },
    },
  }

  await assert.rejects(
    submitWork('student_1', 'task_1', { content: 'My answer' }, database),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'ENROLLMENT_REQUIRED')
      return true
    },
  )
  assert.equal(submissionWasQueried, false)
})

test('a missing learning task returns a clear not-found error', async () => {
  const database = {
    learningTask: { findUnique: async () => null },
  }

  await assert.rejects(
    submitWork('student_1', 'task_1', { content: 'My answer' }, database),
    (error) => {
      assert.equal(error.statusCode, 404)
      assert.equal(error.code, 'LEARNING_TASK_NOT_FOUND')
      return true
    },
  )
})
