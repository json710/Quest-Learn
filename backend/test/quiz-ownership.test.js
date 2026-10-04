import assert from 'node:assert/strict'
import test from 'node:test'

import { listInstructorQuizzes, setQuizPublication } from '../src/services/instructor-quiz.service.js'

test('an instructor cannot list quizzes for another instructor course', async () => {
  let quizzesWereListed = false
  const database = {
    course: { findUnique: async () => ({ id: 'course_1', instructorId: 'instructor_2' }) },
    quiz: { findMany: async () => { quizzesWereListed = true } },
  }

  await assert.rejects(listInstructorQuizzes('course_1', 'instructor_1', database), (error) => {
    assert.equal(error.statusCode, 403)
    assert.equal(error.code, 'COURSE_OWNERSHIP_REQUIRED')
    return true
  })
  assert.equal(quizzesWereListed, false)
})

test('an instructor cannot publish a quiz for another instructor course', async () => {
  let quizWasUpdated = false
  const database = {
    quiz: {
      findUnique: async () => ({ id: 'quiz_1', courseId: 'course_1', course: { instructorId: 'instructor_2' } }),
      update: async () => { quizWasUpdated = true },
    },
  }

  await assert.rejects(setQuizPublication('quiz_1', 'instructor_1', true, database), (error) => {
    assert.equal(error.statusCode, 403)
    assert.equal(error.code, 'COURSE_OWNERSHIP_REQUIRED')
    return true
  })
  assert.equal(quizWasUpdated, false)
})

test('a quiz with invalid questions cannot be published', async () => {
  let findCount = 0
  let quizWasUpdated = false
  const database = {
    quiz: {
      findUnique: async () => {
        findCount += 1
        if (findCount === 1) return { id: 'quiz_1', courseId: 'course_1', course: { instructorId: 'instructor_1' } }
        return { questions: [{ id: 'question_1', options: [{ isCorrect: true }] }] }
      },
      update: async () => { quizWasUpdated = true },
    },
  }

  await assert.rejects(setQuizPublication('quiz_1', 'instructor_1', true, database), (error) => {
    assert.equal(error.statusCode, 409)
    assert.equal(error.code, 'QUIZ_NOT_READY')
    return true
  })
  assert.equal(quizWasUpdated, false)
})
