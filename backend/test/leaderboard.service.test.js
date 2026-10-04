import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_LEADERBOARD_LIMIT,
  getStudentLeaderboard,
} from '../src/services/leaderboard.service.js'

const student = (number, xp, createdAt = `2026-01-${String(number).padStart(2, '0')}T00:00:00.000Z`) => ({
  id: `student_${String(number).padStart(2, '0')}`,
  name: `Student ${number}`,
  email: `student${number}@example.com`,
  password: `hash_${number}`,
  role: 'STUDENT',
  xp,
  level: Math.floor(xp / 100) + 1,
  createdAt: new Date(createdAt),
  _count: { badges: number % 4 },
})

test('leaderboard includes only students and orders XP descending', async () => {
  const records = [
    student(1, 120),
    { ...student(2, 999), role: 'INSTRUCTOR' },
    student(3, 250),
  ]
  const result = await getStudentLeaderboard(
    'student_01',
    DEFAULT_LEADERBOARD_LIMIT,
    createLeaderboardDatabase(records),
  )

  assert.deepEqual(result.leaders.map((entry) => entry.id), [
    'student_03',
    'student_01',
  ])
  assert.deepEqual(result.leaders.map((entry) => entry.rank), [1, 2])
})

test('equal XP uses created time and user id for deterministic ordering', async () => {
  const sameTime = '2026-01-01T00:00:00.000Z'
  const records = [
    student(3, 200, sameTime),
    student(2, 200, sameTime),
    student(1, 200, '2025-12-31T00:00:00.000Z'),
  ]
  const result = await getStudentLeaderboard(
    'student_03',
    DEFAULT_LEADERBOARD_LIMIT,
    createLeaderboardDatabase(records),
  )

  assert.deepEqual(result.leaders.map((entry) => entry.id), [
    'student_01',
    'student_02',
    'student_03',
  ])
  assert.equal(result.currentUser.rank, 3)
})

test('top 10 is limited while an outside current student keeps their rank', async () => {
  const records = Array.from({ length: 12 }, (_, index) =>
    student(index + 1, 1200 - index * 10),
  )
  const result = await getStudentLeaderboard(
    'student_12',
    DEFAULT_LEADERBOARD_LIMIT,
    createLeaderboardDatabase(records),
  )

  assert.equal(result.leaders.length, 10)
  assert.equal(result.leaders.at(-1).rank, 10)
  assert.equal(result.currentUser.id, 'student_12')
  assert.equal(result.currentUser.rank, 12)
})

test('leaderboard responses never expose email or password', async () => {
  const result = await getStudentLeaderboard(
    'student_01',
    DEFAULT_LEADERBOARD_LIMIT,
    createLeaderboardDatabase([student(1, 100)]),
  )

  for (const entry of [...result.leaders, result.currentUser]) {
    assert.equal('email' in entry, false)
    assert.equal('password' in entry, false)
    assert.deepEqual(Object.keys(entry), [
      'rank',
      'id',
      'name',
      'xp',
      'level',
      'badgeCount',
    ])
  }
})

function createLeaderboardDatabase(records) {
  const students = records.filter((record) => record.role === 'STUDENT')
  const compareStudents = (left, right) =>
    right.xp - left.xp ||
    left.createdAt.getTime() - right.createdAt.getTime() ||
    left.id.localeCompare(right.id)

  return {
    user: {
      findMany: async ({ where, take, orderBy, select }) => {
        assert.equal(where.role, 'STUDENT')
        assert.deepEqual(orderBy, [
          { xp: 'desc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ])
        assert.equal(select.email, undefined)
        assert.equal(select.password, undefined)
        return [...students].sort(compareStudents).slice(0, take)
      },
      findFirst: async ({ where, select }) => {
        assert.equal(select.email, undefined)
        assert.equal(select.password, undefined)
        return students.find(
          (record) => record.id === where.id && record.role === where.role,
        ) ?? null
      },
      count: async ({ where }) => {
        assert.equal(where.role, 'STUDENT')
        const current = students.find((record) =>
          where.OR.some((condition) =>
            condition.xp === record.xp &&
            condition.createdAt instanceof Date &&
            condition.createdAt.getTime() === record.createdAt.getTime() &&
            condition.id?.lt === record.id,
          ),
        )
        return current
          ? students.filter((record) => compareStudents(record, current) < 0).length
          : 0
      },
    },
  }
}
