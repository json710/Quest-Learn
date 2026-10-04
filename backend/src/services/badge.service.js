import { prisma } from '../config/database.js'

const badgeSelect = {
  id: true,
  key: true,
  name: true,
  description: true,
  requirement: true,
  iconKey: true,
  createdAt: true,
}

const earnedBadgeSelect = {
  earnedAt: true,
  sourceId: true,
  badge: { select: badgeSelect },
}

export const awardBadge = async (
  userId,
  badgeKey,
  sourceId,
  database = prisma,
) => {
  const awarded = await database.$queryRaw`
    INSERT INTO "UserBadge" ("userId", "badgeId", "sourceId")
    SELECT ${userId}, "id", ${sourceId}
    FROM "Badge"
    WHERE "key" = ${badgeKey}::"BadgeKey"
    ON CONFLICT DO NOTHING
    RETURNING "badgeId", "earnedAt", "sourceId"
  `

  if (awarded.length === 0) return null

  const badge = await database.badge.findUnique({
    where: { id: awarded[0].badgeId },
    select: badgeSelect,
  })

  return {
    ...badge,
    earnedAt: awarded[0].earnedAt,
    sourceId: awarded[0].sourceId,
  }
}

const awardKeys = async (userId, sourceId, keys, database) => {
  const badges = []

  for (const key of keys) {
    const badge = await awardBadge(userId, key, sourceId, database)
    if (badge) badges.push(badge)
  }

  return badges
}

export const awardQuizSubmissionBadges = async (
  userId,
  quizAttemptId,
  score,
  database = prisma,
) => {
  const keys = ['FIRST_QUIZ']
  if (score >= 85) keys.push('QUIZ_MASTER')

  return awardKeys(userId, quizAttemptId, keys, database)
}

export const awardTaskReviewBadges = async (
  userId,
  submissionId,
  database = prisma,
) => {
  return awardKeys(
    userId,
    submissionId,
    ['FIRST_TASK_REVIEWED'],
    database,
  )
}

export const awardLevelBadge = (
  userId,
  level,
  sourceId,
  database = prisma,
) =>
  level >= 2
    ? awardKeys(userId, sourceId, ['LEVEL_2'], database)
    : Promise.resolve([])

export const listAvailableBadges = (database = prisma) =>
  database.badge.findMany({
    select: badgeSelect,
    orderBy: { createdAt: 'asc' },
  })

export const listEarnedBadges = (userId, database = prisma) =>
  database.userBadge.findMany({
    where: { userId },
    select: earnedBadgeSelect,
    orderBy: { earnedAt: 'desc' },
  })

export const listBadgeAwardsForSource = (
  userId,
  sourceId,
  database = prisma,
) =>
  database.userBadge.findMany({
    where: { userId, sourceId },
    select: earnedBadgeSelect,
    orderBy: { earnedAt: 'asc' },
  })

export const listBadgeAwardsForSources = (
  userId,
  sourceIds,
  database = prisma,
) => {
  if (sourceIds.length === 0) return Promise.resolve([])

  return database.userBadge.findMany({
    where: { userId, sourceId: { in: sourceIds } },
    select: earnedBadgeSelect,
    orderBy: { earnedAt: 'asc' },
  })
}
