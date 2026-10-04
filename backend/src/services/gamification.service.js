import { randomUUID } from 'node:crypto'

import { prisma } from '../config/database.js'
import { awardLevelBadge } from './badge.service.js'

export const XP_PER_LEVEL = 100
export const TASK_REVIEW_XP = 20

export const calculateLevel = (totalXp) =>
  Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1

export const quizXpForScore = (score) => {
  if (score < 0 || score > 100) {
    throw new RangeError('Quiz score must be between 0 and 100')
  }
  if (score < 50) return 10
  if (score < 70) return 20
  if (score < 85) return 30
  return 50
}

const rewardSelect = {
  id: true,
  type: true,
  amount: true,
  xpAfter: true,
  levelBefore: true,
  levelAfter: true,
  quizAttemptId: true,
  submissionId: true,
  createdAt: true,
}

const toRewardResult = (reward, user, awarded, newlyEarnedBadges = []) => ({
  ...reward,
  awarded,
  levelUp: reward.levelAfter > reward.levelBefore,
  user: { xp: user.xp, level: user.level },
  newlyEarnedBadges,
})

export const awardXp = async (
  {
    userId,
    type,
    amount,
    quizAttemptId = null,
    submissionId = null,
  },
  database = prisma,
) => {
  if (Boolean(quizAttemptId) === Boolean(submissionId)) {
    throw new Error('An XP reward must have exactly one source')
  }

  const inserted = await database.$queryRaw`
    INSERT INTO "XpReward" (
      "id", "type", "amount", "xpAfter", "levelBefore", "levelAfter",
      "userId", "quizAttemptId", "submissionId"
    )
    VALUES (
      ${randomUUID()}, ${type}::"XpRewardType", ${amount}, 0, 0, 0,
      ${userId}, ${quizAttemptId}, ${submissionId}
    )
    ON CONFLICT DO NOTHING
    RETURNING "id"
  `

  if (inserted.length === 0) {
    const reward = await database.xpReward.findFirst({
      where: quizAttemptId ? { quizAttemptId } : { submissionId },
      select: rewardSelect,
    })
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    })
    const newlyEarnedBadges = await awardLevelBadge(
      userId,
      user.level,
      quizAttemptId ?? submissionId,
      database,
    )
    return toRewardResult(reward, user, false, newlyEarnedBadges)
  }

  const [user] = await database.$queryRaw`
    UPDATE "User"
    SET
      "xp" = "xp" + ${amount},
      "level" = FLOOR(("xp" + ${amount}) / ${XP_PER_LEVEL})::integer + 1,
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${userId}
    RETURNING "xp", "level"
  `

  const levelBefore = calculateLevel(user.xp - amount)
  const reward = await database.xpReward.update({
    where: { id: inserted[0].id },
    data: {
      xpAfter: user.xp,
      levelBefore,
      levelAfter: user.level,
    },
    select: rewardSelect,
  })

  const newlyEarnedBadges = await awardLevelBadge(
    userId,
    user.level,
    quizAttemptId ?? submissionId,
    database,
  )

  return toRewardResult(reward, user, true, newlyEarnedBadges)
}

export const awardQuizAttemptXp = (
  userId,
  quizAttemptId,
  score,
  database = prisma,
) =>
  awardXp(
    {
      userId,
      type: 'QUIZ_ATTEMPT',
      amount: quizXpForScore(score),
      quizAttemptId,
    },
    database,
  )

export const awardTaskReviewXp = (
  userId,
  submissionId,
  database = prisma,
) =>
  awardXp(
    {
      userId,
      type: 'TASK_REVIEW',
      amount: TASK_REVIEW_XP,
      submissionId,
    },
    database,
  )
