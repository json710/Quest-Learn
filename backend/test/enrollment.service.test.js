import assert from 'node:assert/strict'
import test from 'node:test'

import { enrollInCourse } from '../src/services/enrollment.service.js'

test('duplicate enrollment is rejected before creating another record', async () => {
  let createWasCalled = false
  const database = {
    course: {
      findFirst: async () => ({ id: 'course_1' }),
    },
    enrollment: {
      findUnique: async () => ({ id: 'enrollment_1' }),
      create: async () => {
        createWasCalled = true
      },
    },
  }

  await assert.rejects(
    enrollInCourse('student_1', 'course_1', database),
    (error) => {
      assert.equal(error.statusCode, 409)
      assert.equal(error.code, 'ALREADY_ENROLLED')
      return true
    },
  )
  assert.equal(createWasCalled, false)
})

test('students cannot enroll in an unavailable course', async () => {
  const database = {
    course: { findFirst: async () => null },
    enrollment: {},
  }

  await assert.rejects(
    enrollInCourse('student_1', 'course_1', database),
    (error) => {
      assert.equal(error.statusCode, 404)
      assert.equal(error.code, 'COURSE_NOT_FOUND')
      return true
    },
  )
})
