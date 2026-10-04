import assert from 'node:assert/strict'
import test from 'node:test'

import { getAvailableQuiz } from '../src/services/student-quiz.service.js'

test('students cannot access quizzes without course enrollment', async () => {
  let detailsWereQueried = false
  const database = {
    quiz: {
      findUnique: async () => {
        if (detailsWereQueried) return null
        return { id: 'quiz_1', courseId: 'course_1', isPublished: true }
      },
    },
    enrollment: { findUnique: async () => null },
  }

  await assert.rejects(getAvailableQuiz('student_1', 'quiz_1', database), (error) => {
    assert.equal(error.statusCode, 403)
    assert.equal(error.code, 'ENROLLMENT_REQUIRED')
    return true
  })
  assert.equal(detailsWereQueried, false)
})

test('unpublished quizzes are hidden before enrollment is checked', async () => {
  let enrollmentWasQueried = false
  const database = {
    quiz: { findUnique: async () => ({ id: 'quiz_1', courseId: 'course_1', isPublished: false }) },
    enrollment: { findUnique: async () => { enrollmentWasQueried = true } },
  }

  await assert.rejects(getAvailableQuiz('student_1', 'quiz_1', database), (error) => {
    assert.equal(error.statusCode, 404)
    assert.equal(error.code, 'QUIZ_NOT_FOUND')
    return true
  })
  assert.equal(enrollmentWasQueried, false)
})

test('student quiz details never select correct answers', async () => {
  let queryCount = 0
  const database = {
    quiz: {
      findUnique: async (query) => {
        queryCount += 1
        if (queryCount === 1) return { id: 'quiz_1', courseId: 'course_1', isPublished: true }
        assert.equal(JSON.stringify(query.select).includes('isCorrect'), false)
        return {
          id: 'quiz_1',
          questions: [{ id: 'question_1', options: [{ id: 'option_1', text: 'Answer' }] }],
        }
      },
    },
    enrollment: { findUnique: async () => ({ id: 'enrollment_1' }) },
  }

  const quiz = await getAvailableQuiz('student_1', 'quiz_1', database)
  assert.equal('isCorrect' in quiz.questions[0].options[0], false)
})
