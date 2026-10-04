import assert from 'node:assert/strict'
import test from 'node:test'

import {
  listTaskSubmissions,
  reviewSubmission,
} from '../src/services/submission.service.js'
import { reviewSubmissionSchema } from '../src/validation/submission.schemas.js'

const submissionForInstructor = (instructorId) => ({
  id: 'submission_1',
  learningTask: {
    course: { instructorId },
  },
})

test('instructors cannot list submissions for another instructor course', async () => {
  let submissionsWereListed = false
  const database = {
    learningTask: {
      findUnique: async () => ({
        id: 'task_1',
        course: { instructorId: 'instructor_2' },
      }),
    },
    submission: {
      findMany: async () => {
        submissionsWereListed = true
      },
    },
  }

  await assert.rejects(
    listTaskSubmissions('instructor_1', 'task_1', database),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'COURSE_OWNERSHIP_REQUIRED')
      return true
    },
  )
  assert.equal(submissionsWereListed, false)
})

test('instructors cannot review submissions from another instructor course', async () => {
  let updateWasCalled = false
  const database = {
    submission: {
      findUnique: async () => submissionForInstructor('instructor_2'),
      update: async () => {
        updateWasCalled = true
      },
    },
  }

  await assert.rejects(
    reviewSubmission(
      'instructor_1',
      'submission_1',
      { score: 80, feedback: 'Good work' },
      database,
    ),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'COURSE_OWNERSHIP_REQUIRED')
      return true
    },
  )
  assert.equal(updateWasCalled, false)
})

test('review scores must be whole numbers between 0 and 100', () => {
  assert.equal(
    reviewSubmissionSchema.safeParse({ score: 80, feedback: 'Good work' })
      .success,
    true,
  )
  assert.equal(
    reviewSubmissionSchema.safeParse({ score: -1, feedback: 'Try again' })
      .success,
    false,
  )
  assert.equal(
    reviewSubmissionSchema.safeParse({ score: 101, feedback: 'Excellent' })
      .success,
    false,
  )
  assert.equal(
    reviewSubmissionSchema.safeParse({ score: 92.5, feedback: 'Good work' })
      .success,
    false,
  )
})
