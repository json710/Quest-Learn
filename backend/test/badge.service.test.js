import assert from 'node:assert/strict'
import test from 'node:test'

import {
  awardLevelBadge,
  awardQuizSubmissionBadges,
  awardTaskReviewBadges,
} from '../src/services/badge.service.js'

test('first quiz awards FIRST_QUIZ only once', async () => {
  const { database, state } = createBadgeDatabase({ submittedAttempts: 1 })

  const first = await awardQuizSubmissionBadges(
    'student_1',
    'attempt_1',
    70,
    database,
  )
  const repeated = await awardQuizSubmissionBadges(
    'student_1',
    'attempt_1',
    70,
    database,
  )

  assert.deepEqual(first.map((badge) => badge.key), ['FIRST_QUIZ'])
  assert.deepEqual(repeated, [])
  assert.equal(state.userBadges.size, 1)
})

test('a score of 85 or higher awards QUIZ_MASTER and a lower score does not', async () => {
  const high = createBadgeDatabase({ submittedAttempts: 2 })
  const low = createBadgeDatabase({ submittedAttempts: 2 })

  const highBadges = await awardQuizSubmissionBadges(
    'student_1',
    'attempt_high',
    85,
    high.database,
  )
  const lowBadges = await awardQuizSubmissionBadges(
    'student_1',
    'attempt_low',
    84,
    low.database,
  )

  assert.deepEqual(highBadges.map((badge) => badge.key), [
    'FIRST_QUIZ',
    'QUIZ_MASTER',
  ])
  assert.deepEqual(lowBadges.map((badge) => badge.key), ['FIRST_QUIZ'])
})

test('first reviewed task awards FIRST_TASK_REVIEWED only once', async () => {
  const { database, state } = createBadgeDatabase({ reviewedSubmissions: 1 })

  const first = await awardTaskReviewBadges(
    'student_1',
    'submission_1',
    database,
  )
  const repeated = await awardTaskReviewBadges(
    'student_1',
    'submission_1',
    database,
  )

  assert.deepEqual(first.map((badge) => badge.key), ['FIRST_TASK_REVIEWED'])
  assert.deepEqual(repeated, [])
  assert.equal(state.userBadges.size, 1)
})

test('reaching Level 2 awards LEVEL_2 only once', async () => {
  const { database, state } = createBadgeDatabase({})

  assert.deepEqual(await awardLevelBadge('student_1', 1, 'attempt_1', database), [])
  const first = await awardLevelBadge('student_1', 2, 'attempt_1', database)
  const repeated = await awardLevelBadge('student_1', 3, 'attempt_2', database)

  assert.deepEqual(first.map((badge) => badge.key), ['LEVEL_2'])
  assert.deepEqual(repeated, [])
  assert.equal(state.userBadges.size, 1)
})

const badgeDefinitions = {
  FIRST_QUIZ: { id: 'badge_first_quiz', key: 'FIRST_QUIZ', name: 'First Steps' },
  QUIZ_MASTER: { id: 'badge_quiz_master', key: 'QUIZ_MASTER', name: 'Quiz Master' },
  FIRST_TASK_REVIEWED: { id: 'badge_first_task_reviewed', key: 'FIRST_TASK_REVIEWED', name: 'Feedback Ready' },
  LEVEL_2: { id: 'badge_level_2', key: 'LEVEL_2', name: 'Rising Learner' },
}

function createBadgeDatabase({ submittedAttempts = 0, reviewedSubmissions = 0 }) {
  const state = { userBadges: new Map() }
  const database = {
    $queryRaw: async (_strings, ...values) => {
      const [userId, sourceId, badgeKey] = values
      const badge = badgeDefinitions[badgeKey]
      const recordKey = `${userId}:${badge.id}`
      if (state.userBadges.has(recordKey)) return []

      const earnedAt = new Date()
      state.userBadges.set(recordKey, { userId, badgeId: badge.id, sourceId, earnedAt })
      return [{ badgeId: badge.id, sourceId, earnedAt }]
    },
    badge: {
      findUnique: async ({ where }) =>
        Object.values(badgeDefinitions).find((badge) => badge.id === where.id),
    },
    quizAttempt: { count: async () => submittedAttempts },
    submission: { count: async () => reviewedSubmissions },
  }

  return { database, state }
}
