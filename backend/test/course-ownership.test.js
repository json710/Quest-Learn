import assert from 'node:assert/strict'
import test from 'node:test'

import { updateCourse } from '../src/services/course.service.js'

test('an instructor cannot update a course owned by another instructor', async () => {
  let updateWasCalled = false
  const database = {
    course: {
      findUnique: async () => ({
        id: 'course_1',
        instructorId: 'instructor_2',
      }),
      update: async () => {
        updateWasCalled = true
      },
    },
  }

  await assert.rejects(
    updateCourse(
      'course_1',
      'instructor_1',
      { title: 'Updated title' },
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

test('a course owner can update their course', async () => {
  const updatedCourse = { id: 'course_1', title: 'Updated title' }
  const database = {
    course: {
      findUnique: async () => ({
        id: 'course_1',
        instructorId: 'instructor_1',
      }),
      update: async ({ data }) => ({ ...updatedCourse, ...data }),
    },
  }

  const result = await updateCourse(
    'course_1',
    'instructor_1',
    { title: 'Updated title' },
    database,
  )

  assert.deepEqual(result, updatedCourse)
})
