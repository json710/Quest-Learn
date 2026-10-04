import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateSubmissionCompletionRate,
  getInstructorCourseAnalytics,
  getStudentAnalytics,
} from '../src/services/analytics.service.js'

test('student analytics returns correct totals, average, and course progress', async () => {
  const database = createStudentAnalyticsDatabase()
  const result = await getStudentAnalytics('student_1', database)

  assert.deepEqual(result.summary, {
    level: 3,
    xp: 240,
    earnedBadgeCount: 2,
    enrolledCourseCount: 2,
    quizzesCompleted: 3,
    averageQuizScore: 82.3,
    learningTasksSubmitted: 3,
    reviewedTasks: 2,
  })
  assert.deepEqual(result.courseProgress[0], {
    courseId: 'course_1',
    title: 'Web Fundamentals',
    completedActivities: 2,
    totalActivities: 3,
    progressPercentage: 66.7,
  })
  assert.equal(result.courseProgress[1].progressPercentage, 0)
  assert.deepEqual(result.recentQuizScores.map((attempt) => attempt.score), [70, 90])
})

test('student analytics safely returns zero values when activity data is empty', async () => {
  const database = createStudentAnalyticsDatabase({ empty: true })
  const result = await getStudentAnalytics('student_1', database)

  assert.equal(result.summary.quizzesCompleted, 0)
  assert.equal(result.summary.averageQuizScore, 0)
  assert.equal(result.summary.learningTasksSubmitted, 0)
  assert.equal(result.summary.reviewedTasks, 0)
  assert.deepEqual(result.courseProgress, [])
  assert.deepEqual(result.recentQuizScores, [])
})

test('instructors cannot access analytics for a course they do not own', async () => {
  let aggregateWasCalled = false
  const database = {
    course: {
      findUnique: async () => ({
        id: 'course_1',
        instructorId: 'instructor_2',
      }),
    },
    quizAttempt: {
      groupBy: async () => {
        aggregateWasCalled = true
      },
    },
  }

  await assert.rejects(
    getInstructorCourseAnalytics(
      'instructor_1',
      'course_1',
      database,
    ),
    (error) => {
      assert.equal(error.statusCode, 403)
      assert.equal(error.code, 'COURSE_OWNERSHIP_REQUIRED')
      return true
    },
  )
  assert.equal(aggregateWasCalled, false)
})

test('instructor analytics calculates completion and exposes safe student fields', async () => {
  const database = createInstructorAnalyticsDatabase()
  const result = await getInstructorCourseAnalytics(
    'instructor_1',
    'course_1',
    database,
  )

  assert.equal(result.course.enrolledStudentCount, 2)
  assert.equal(result.course.quizAttempts, 4)
  assert.equal(result.course.averageQuizScore, 86.7)
  assert.equal(result.course.submissionCount, 3)
  assert.equal(result.course.reviewedSubmissionCount, 2)
  assert.equal(result.course.submissionCompletionRate, 75)
  assert.deepEqual(Object.keys(result.topStudents[0]), [
    'rank',
    'id',
    'name',
    'xp',
    'level',
    'badgeCount',
  ])
  assert.equal(JSON.stringify(result).includes('student@example.com'), false)
  assert.equal(JSON.stringify(result).includes('password_hash'), false)
})

test('submission completion avoids division by zero', () => {
  assert.equal(calculateSubmissionCompletionRate(0, 0, 0), 0)
  assert.equal(calculateSubmissionCompletionRate(0, 5, 0), 0)
  assert.equal(calculateSubmissionCompletionRate(3, 2, 2), 75)
})

test('an owned course with no activity returns valid zero analytics', async () => {
  const database = createInstructorAnalyticsDatabase({ empty: true })
  const result = await getInstructorCourseAnalytics(
    'instructor_1',
    'course_1',
    database,
  )

  assert.equal(result.course.enrolledStudentCount, 0)
  assert.equal(result.course.quizAttempts, 0)
  assert.equal(result.course.averageQuizScore, 0)
  assert.equal(result.course.submissionCompletionRate, 0)
  assert.deepEqual(result.topStudents, [])
})

function createStudentAnalyticsDatabase({ empty = false } = {}) {
  const recentScores = empty
    ? []
    : [
        { id: 'attempt_2', score: 90, submittedAt: new Date('2026-02-02'), quiz: { title: 'Quiz 2' } },
        { id: 'attempt_1', score: 70, submittedAt: new Date('2026-02-01'), quiz: { title: 'Quiz 1' } },
      ]

  return {
    user: {
      findFirst: async () => ({
        id: 'student_1',
        xp: empty ? 0 : 240,
        level: empty ? 1 : 3,
        _count: {
          badges: empty ? 0 : 2,
          enrollments: empty ? 0 : 2,
          submissions: empty ? 0 : 3,
        },
      }),
    },
    quizAttempt: {
      aggregate: async () => ({
        _count: { id: empty ? 0 : 3 },
        _avg: { score: empty ? null : 82.333 },
      }),
      findMany: async (query) => {
        if (query.take) return recentScores
        return empty
          ? []
          : [{ quizId: 'quiz_1', quiz: { courseId: 'course_1' } }]
      },
    },
    submission: {
      count: async () => (empty ? 0 : 2),
      findMany: async () => empty
        ? []
        : [{ learningTaskId: 'task_1', learningTask: { courseId: 'course_1' } }],
    },
    enrollment: {
      findMany: async () => empty
        ? []
        : [
            { course: { id: 'course_1', title: 'Web Fundamentals', _count: { learningTasks: 2, quizzes: 1 } } },
            { course: { id: 'course_2', title: 'Empty Course', _count: { learningTasks: 0, quizzes: 0 } } },
          ],
    },
  }
}

function createInstructorAnalyticsDatabase({ empty = false } = {}) {
  const course = {
    id: 'course_1',
    title: 'Web Fundamentals',
    isPublished: true,
    instructorId: 'instructor_1',
    learningTasks: empty ? [] : [{ id: 'task_1' }, { id: 'task_2' }],
    quizzes: empty ? [] : [{ id: 'quiz_1' }, { id: 'quiz_2' }],
    _count: { enrollments: empty ? 0 : 2 },
  }

  return {
    course: { findUnique: async () => course },
    quizAttempt: {
      groupBy: async () => empty ? [] : [
        {
          quizId: 'quiz_1',
          _count: { id: 3, score: 2 },
          _avg: { score: 80 },
        },
        {
          quizId: 'quiz_2',
          _count: { id: 1, score: 1 },
          _avg: { score: 100 },
        },
      ],
    },
    submission: {
      groupBy: async () => empty ? [] : [
        { learningTaskId: 'task_1', status: 'SUBMITTED', _count: { id: 1 } },
        { learningTaskId: 'task_1', status: 'REVIEWED', _count: { id: 1 } },
        { learningTaskId: 'task_2', status: 'REVIEWED', _count: { id: 1 } },
      ],
    },
    enrollment: {
      findMany: async ({ select }) => {
        assert.equal(select.student.select.email, undefined)
        assert.equal(select.student.select.password, undefined)
        return empty ? [] : [{
        student: {
          id: 'student_1',
          name: 'Student One',
          email: 'student@example.com',
          password: 'password_hash',
          xp: 240,
          level: 3,
          _count: { badges: 2 },
        },
        }]
      },
    },
  }
}
