import assert from 'node:assert/strict'
import test from 'node:test'

import { updateStudentSubmission } from '../src/services/submission.service.js'

test('students can update their submission before review', async () => {
  let queryCount = 0
  const updatedSubmission = {
    id: 'submission_1',
    content: 'Revised answer',
    status: 'SUBMITTED',
  }
  const database = {
    submission: {
      findUnique: async () => {
        queryCount += 1
        return queryCount === 1
          ? { id: 'submission_1', studentId: 'student_1', status: 'SUBMITTED' }
          : updatedSubmission
      },
      updateMany: async () => ({ count: 1 }),
    },
  }

  const result = await updateStudentSubmission(
    'student_1',
    'submission_1',
    { content: 'Revised answer' },
    database,
  )

  assert.deepEqual(result, updatedSubmission)
})

test('students cannot update a reviewed submission', async () => {
  let updateWasCalled = false
  const database = {
    submission: {
      findUnique: async () => ({
        id: 'submission_1',
        studentId: 'student_1',
        status: 'REVIEWED',
      }),
      updateMany: async () => {
        updateWasCalled = true
      },
    },
  }

  await assert.rejects(
    updateStudentSubmission(
      'student_1',
      'submission_1',
      { content: 'Too late' },
      database,
    ),
    (error) => {
      assert.equal(error.statusCode, 409)
      assert.equal(error.code, 'SUBMISSION_ALREADY_REVIEWED')
      return true
    },
  )
  assert.equal(updateWasCalled, false)
})

test('students cannot update another student submission', async () => {
  const database = {
    submission: {
      findUnique: async () => ({
        id: 'submission_1',
        studentId: 'student_2',
        status: 'SUBMITTED',
      }),
    },
  }

  await assert.rejects(
    updateStudentSubmission(
      'student_1',
      'submission_1',
      { content: 'Unauthorized update' },
      database,
    ),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'SUBMISSION_OWNERSHIP_REQUIRED')
      return true
    },
  )
})
