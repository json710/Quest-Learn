import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateQuizScore,
  getQuizAttemptResult,
  submitQuizAttempt,
} from '../src/services/student-quiz.service.js'

const questions = [
  { id: 'question_1', options: [{ id: 'option_1', isCorrect: true }, { id: 'option_2', isCorrect: false }] },
  { id: 'question_2', options: [{ id: 'option_3', isCorrect: false }, { id: 'option_4', isCorrect: true }] },
  { id: 'question_3', options: [{ id: 'option_5', isCorrect: true }, { id: 'option_6', isCorrect: false }] },
]

test('quiz scores are calculated as a percentage of all questions', () => {
  const score = calculateQuizScore(questions, [
    { questionId: 'question_1', optionId: 'option_1' },
    { questionId: 'question_2', optionId: 'option_3' },
  ])
  assert.equal(score, 33)
})

test('a submitted attempt cannot be submitted again', async () => {
  let transactionWasCalled = false
  const database = {
    quizAttempt: { findFirst: async () => ({ id: 'attempt_1', submittedAt: new Date(), quiz: { questions: [] } }) },
    $transaction: async () => { transactionWasCalled = true },
  }

  await assert.rejects(submitQuizAttempt('student_1', 'attempt_1', { answers: [] }, database), (error) => {
    assert.equal(error.statusCode, 409)
    assert.equal(error.code, 'QUIZ_ATTEMPT_SUBMITTED')
    return true
  })
  assert.equal(transactionWasCalled, false)
})

test('submitted results expose selected and correct answers for review', async () => {
  const database = {
    quizAttempt: {
      findFirst: async () => ({
        id: 'attempt_1',
        quizId: 'quiz_1',
        studentId: 'student_1',
        startedAt: new Date('2026-01-01'),
        submittedAt: new Date('2026-01-02'),
        score: 100,
        answers: [{ questionId: 'question_1', selectedOptionId: 'option_1' }],
        quiz: { id: 'quiz_1', title: 'Quiz', questions: [questions[0]] },
      }),
    },
    userBadge: { findMany: async () => [] },
  }

  const result = await getQuizAttemptResult('student_1', 'attempt_1', database)
  assert.equal(result.quiz.questions[0].selectedOptionId, 'option_1')
  assert.equal(result.quiz.questions[0].options[0].isCorrect, true)
})
