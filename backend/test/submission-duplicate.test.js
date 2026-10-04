import assert from 'node:assert/strict'
import test from 'node:test'

import { submitWork } from '../src/services/submission.service.js'

test('a student cannot create a duplicate task submission', async () => {
  let createWasCalled = false
  const database = {
    learningTask: {
      findUnique: async () => ({ id: 'task_1', courseId: 'course_1' }),
    },
    enrollment: { findUnique: async () => ({ id: 'enrollment_1' }) },
    submission: {
      findUnique: async () => ({ id: 'submission_1' }),
      create: async () => {
        createWasCalled = true
      },
    },
  }

  await assert.rejects(
    submitWork('student_1', 'task_1', { content: 'My answer' }, database),
    (error) => {
      assert.equal(error.statusCode, 409)
      assert.equal(error.code, 'SUBMISSION_EXISTS')
      return true
    },
  )
  assert.equal(createWasCalled, false)
})

test('a database uniqueness race returns the duplicate conflict', async () => {
  const database = {
    learningTask: {
      findUnique: async () => ({ id: 'task_1', courseId: 'course_1' }),
    },
    enrollment: { findUnique: async () => ({ id: 'enrollment_1' }) },
    submission: {
      findUnique: async () => null,
      create: async () => {
        const error = new Error('Unique constraint violation')
        error.code = 'P2002'
        throw error
      },
    },
  }

  await assert.rejects(
    submitWork('student_1', 'task_1', { content: 'My answer' }, database),
    (error) => {
      assert.equal(error.statusCode, 409)
      assert.equal(error.code, 'SUBMISSION_EXISTS')
      return true
    },
  )
})
