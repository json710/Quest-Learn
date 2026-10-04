import assert from 'node:assert/strict'
import test from 'node:test'

import { submitAttemptSchema } from '../src/validation/quiz.schemas.js'

test('quiz submission validation rejects duplicate answers for one question', () => {
  const result = submitAttemptSchema.safeParse({
    answers: [
      { questionId: 'question_1', optionId: 'option_1' },
      { questionId: 'question_1', optionId: 'option_2' },
    ],
  })
  assert.equal(result.success, false)
})
