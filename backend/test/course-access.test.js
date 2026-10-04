import assert from 'node:assert/strict'
import test from 'node:test'

import { getEnrolledCourseContent } from '../src/services/enrollment.service.js'

test('course learning content requires enrollment', async () => {
  let courseQueryCount = 0
  const database = {
    course: {
      findUnique: async () => {
        courseQueryCount += 1
        return { id: 'course_1' }
      },
    },
    enrollment: {
      findUnique: async () => null,
    },
  }

  await assert.rejects(
    getEnrolledCourseContent('student_1', 'course_1', database),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'ENROLLMENT_REQUIRED')
      return true
    },
  )
  assert.equal(courseQueryCount, 1)
})

test('an enrolled student can access lessons and learning tasks', async () => {
  let courseQueryCount = 0
  const learningContent = {
    id: 'course_1',
    lessons: [{ id: 'lesson_1' }],
    learningTasks: [{ id: 'task_1' }],
  }
  const database = {
    course: {
      findUnique: async () => {
        courseQueryCount += 1
        return courseQueryCount === 1 ? { id: 'course_1' } : learningContent
      },
    },
    enrollment: {
      findUnique: async () => ({ id: 'enrollment_1' }),
    },
  }

  const result = await getEnrolledCourseContent(
    'student_1',
    'course_1',
    database,
  )

  assert.deepEqual(result, learningContent)
})
