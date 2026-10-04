import assert from 'node:assert/strict'
import test from 'node:test'

import {
  awardQuizAttemptXp,
  calculateLevel,
  quizXpForScore,
} from '../src/services/gamification.service.js'
import { reviewSubmission } from '../src/services/submission.service.js'

test('quiz XP follows every score bracket boundary', () => {
  const expectations = new Map([
    [0, 10],
    [49, 10],
    [50, 20],
    [69, 20],
    [70, 30],
    [84, 30],
    [85, 50],
    [100, 50],
  ])

  for (const [score, xp] of expectations) {
    assert.equal(quizXpForScore(score), xp)
  }
})

test('level calculation is correct around 100 XP boundaries', () => {
  assert.equal(calculateLevel(99), 1)
  assert.equal(calculateLevel(100), 2)
  assert.equal(calculateLevel(199), 2)
  assert.equal(calculateLevel(200), 3)
})

test('quiz attempt XP is awarded only once for the same attempt', async () => {
  const { database, state } = createGamificationDatabase({ xp: 80 })

  const first = await awardQuizAttemptXp(
    'student_1',
    'attempt_1',
    90,
    database,
  )
  const repeated = await awardQuizAttemptXp(
    'student_1',
    'attempt_1',
    90,
    database,
  )

  assert.equal(first.amount, 50)
  assert.equal(first.awarded, true)
  assert.equal(first.levelUp, true)
  assert.equal(repeated.awarded, false)
  assert.equal(state.user.xp, 130)
  assert.equal(state.user.level, 2)
})

test('a first task review awards 20 XP and a re-review awards none', async () => {
  const { database, state } = createGamificationDatabase({ xp: 90 })
  state.submission = {
    id: 'submission_1',
    studentId: 'student_1',
    status: 'SUBMITTED',
    learningTask: { course: { instructorId: 'instructor_1' } },
  }

  database.submission = {
    findUnique: async () => ({
      ...state.submission,
      xpReward: state.reward,
    }),
    updateMany: async ({ where, data }) => {
      if (state.submission.status !== where.status) return { count: 0 }
      Object.assign(state.submission, data)
      return { count: 1 }
    },
    update: async ({ data }) => {
      Object.assign(state.submission, data)
      return state.submission
    },
    count: async () => (state.submission.status === 'REVIEWED' ? 1 : 0),
  }
  database.$transaction = async (operation) => operation(database)

  const first = await reviewSubmission(
    'instructor_1',
    'submission_1',
    { score: 80, feedback: 'Good work' },
    database,
  )
  const repeated = await reviewSubmission(
    'instructor_1',
    'submission_1',
    { score: 85, feedback: 'Updated feedback' },
    database,
  )

  assert.equal(first.xpReward.amount, 20)
  assert.equal(repeated.xpReward.amount, 20)
  assert.equal(state.user.xp, 110)
  assert.equal(state.user.level, 2)
  assert.equal(state.rewardInsertions, 1)
  assert.equal(repeated.score, 85)
})

function createGamificationDatabase({ xp }) {
  const state = {
    user: { xp, level: calculateLevel(xp) },
    reward: null,
    rewardInsertions: 0,
    userBadges: new Map(),
  }

  const database = {
    $queryRaw: async (strings, ...values) => {
      const statement = strings.join(' ')

      if (statement.includes('INSERT INTO "XpReward"')) {
        const [, type, amount, userId, quizAttemptId, submissionId] = values
        const duplicate =
          state.reward &&
          (state.reward.quizAttemptId === quizAttemptId ||
            state.reward.submissionId === submissionId)
        if (duplicate) return []

        state.rewardInsertions += 1
        state.reward = {
          id: 'reward_1',
          type,
          amount,
          xpAfter: 0,
          levelBefore: 0,
          levelAfter: 0,
          userId,
          quizAttemptId,
          submissionId,
          createdAt: new Date(),
        }
        return [{ id: state.reward.id }]
      }

      if (statement.includes('INSERT INTO "UserBadge"')) {
        const [userId, sourceId, badgeKey] = values
        const badge = badgeDefinitions[badgeKey]
        const recordKey = `${userId}:${badge.id}`
        if (state.userBadges.has(recordKey)) return []

        const earnedAt = new Date()
        state.userBadges.set(recordKey, { userId, badgeId: badge.id, sourceId, earnedAt })
        return [{ badgeId: badge.id, sourceId, earnedAt }]
      }

      const [amount] = values
      state.user.xp += amount
      state.user.level = calculateLevel(state.user.xp)
      return [{ ...state.user }]
    },
    xpReward: {
      findFirst: async () => state.reward,
      update: async ({ data }) => {
        Object.assign(state.reward, data)
        return state.reward
      },
    },
    user: {
      findUnique: async () => ({ ...state.user }),
    },
    badge: {
      findUnique: async ({ where }) =>
        Object.values(badgeDefinitions).find((badge) => badge.id === where.id),
    },
  }

  return { database, state }
}

const badgeDefinitions = {
  FIRST_TASK_REVIEWED: {
    id: 'badge_first_task_reviewed',
    key: 'FIRST_TASK_REVIEWED',
    name: 'Feedback Ready',
  },
  LEVEL_2: { id: 'badge_level_2', key: 'LEVEL_2', name: 'Rising Learner' },
}
