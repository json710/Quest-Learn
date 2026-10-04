import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'
import { assertCourseOwnership } from '../utils/course-access.js'

const roundOne = (value) => Math.round((Number(value) || 0) * 10) / 10

const percentage = (completed, total) =>
  total === 0 ? 0 : Math.min(100, roundOne((completed / total) * 100))

export const calculateSubmissionCompletionRate = (
  submissionCount,
  enrolledStudentCount,
  learningTaskCount,
) => percentage(
  submissionCount,
  enrolledStudentCount * learningTaskCount,
)

const studentOverviewSelect = {
  id: true,
  xp: true,
  level: true,
  _count: {
    select: {
      badges: true,
      enrollments: true,
      submissions: true,
    },
  },
}

export const getStudentAnalytics = async (studentId, database = prisma) => {
  const [
    student,
    quizAggregate,
    reviewedTasks,
    enrollments,
    completedCourseQuizzes,
    submittedCourseTasks,
    recentQuizScores,
  ] = await Promise.all([
    database.user.findFirst({
      where: { id: studentId, role: 'STUDENT' },
      select: studentOverviewSelect,
    }),
    database.quizAttempt.aggregate({
      where: { studentId, submittedAt: { not: null } },
      _count: { id: true },
      _avg: { score: true },
    }),
    database.submission.count({
      where: { studentId, status: 'REVIEWED' },
    }),
    database.enrollment.findMany({
      where: { studentId },
      select: {
        course: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                learningTasks: true,
                quizzes: { where: { isPublished: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    database.quizAttempt.findMany({
      where: {
        studentId,
        submittedAt: { not: null },
        quiz: { isPublished: true },
      },
      select: { quizId: true, quiz: { select: { courseId: true } } },
      distinct: ['quizId'],
    }),
    database.submission.findMany({
      where: { studentId },
      select: {
        learningTaskId: true,
        learningTask: { select: { courseId: true } },
      },
      distinct: ['learningTaskId'],
    }),
    database.quizAttempt.findMany({
      where: { studentId, submittedAt: { not: null } },
      select: {
        id: true,
        score: true,
        submittedAt: true,
        quiz: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    }),
  ])

  if (!student) {
    throw new AppError(404, 'Student was not found', 'STUDENT_NOT_FOUND')
  }

  const completedQuizzesByCourse = new Map()
  for (const attempt of completedCourseQuizzes) {
    const quizIds = completedQuizzesByCourse.get(attempt.quiz.courseId) ?? new Set()
    quizIds.add(attempt.quizId)
    completedQuizzesByCourse.set(attempt.quiz.courseId, quizIds)
  }

  const submittedTasksByCourse = new Map()
  for (const submission of submittedCourseTasks) {
    const taskIds = submittedTasksByCourse.get(submission.learningTask.courseId) ?? new Set()
    taskIds.add(submission.learningTaskId)
    submittedTasksByCourse.set(submission.learningTask.courseId, taskIds)
  }

  const courseProgress = enrollments.map(({ course }) => {
    const totalActivities =
      course._count.learningTasks + course._count.quizzes
    const completedActivities = Math.min(
      totalActivities,
      (completedQuizzesByCourse.get(course.id)?.size ?? 0) +
        (submittedTasksByCourse.get(course.id)?.size ?? 0),
    )

    return {
      courseId: course.id,
      title: course.title,
      completedActivities,
      totalActivities,
      progressPercentage: percentage(completedActivities, totalActivities),
    }
  })

  return {
    summary: {
      level: student.level,
      xp: student.xp,
      earnedBadgeCount: student._count.badges,
      enrolledCourseCount: student._count.enrollments,
      quizzesCompleted: quizAggregate._count.id,
      averageQuizScore: roundOne(quizAggregate._avg.score),
      learningTasksSubmitted: student._count.submissions,
      reviewedTasks,
    },
    recentQuizScores: recentQuizScores.reverse().map((attempt) => ({
      attemptId: attempt.id,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      submittedAt: attempt.submittedAt,
    })),
    courseProgress,
  }
}

const instructorCourseSelect = {
  id: true,
  title: true,
  isPublished: true,
  instructorId: true,
  learningTasks: { select: { id: true } },
  quizzes: { select: { id: true } },
  _count: { select: { enrollments: true } },
}

const buildInstructorCourseMetrics = async (
  courses,
  instructorId,
  database,
) => {
  if (courses.length === 0) return []

  const [quizGroups, submissionGroups] = await Promise.all([
    database.quizAttempt.groupBy({
      by: ['quizId'],
      where: { quiz: { course: { instructorId } } },
      _count: { id: true, score: true },
      _avg: { score: true },
    }),
    database.submission.groupBy({
      by: ['learningTaskId', 'status'],
      where: { learningTask: { course: { instructorId } } },
      _count: { id: true },
    }),
  ])

  const courseByQuiz = new Map()
  const courseByTask = new Map()
  const metricsByCourse = new Map()

  for (const course of courses) {
    for (const quiz of course.quizzes) courseByQuiz.set(quiz.id, course.id)
    for (const task of course.learningTasks) courseByTask.set(task.id, course.id)
    metricsByCourse.set(course.id, {
      quizAttempts: 0,
      scoredAttempts: 0,
      quizScoreTotal: 0,
      submissionCount: 0,
      reviewedSubmissionCount: 0,
    })
  }

  for (const group of quizGroups) {
    const courseId = courseByQuiz.get(group.quizId)
    const metrics = metricsByCourse.get(courseId)
    if (!metrics) continue

    metrics.quizAttempts += group._count.id
    metrics.scoredAttempts += group._count.score
    metrics.quizScoreTotal +=
      (group._avg.score ?? 0) * group._count.score
  }

  for (const group of submissionGroups) {
    const courseId = courseByTask.get(group.learningTaskId)
    const metrics = metricsByCourse.get(courseId)
    if (!metrics) continue

    metrics.submissionCount += group._count.id
    if (group.status === 'REVIEWED') {
      metrics.reviewedSubmissionCount += group._count.id
    }
  }

  return courses.map((course) => {
    const metrics = metricsByCourse.get(course.id)
    const enrolledStudentCount = course._count.enrollments
    const totalLearningTasks = course.learningTasks.length

    return {
      courseId: course.id,
      title: course.title,
      isPublished: course.isPublished,
      enrolledStudentCount,
      totalQuizzes: course.quizzes.length,
      quizAttempts: metrics.quizAttempts,
      averageQuizScore: metrics.scoredAttempts === 0
        ? 0
        : roundOne(metrics.quizScoreTotal / metrics.scoredAttempts),
      totalLearningTasks,
      submissionCount: metrics.submissionCount,
      reviewedSubmissionCount: metrics.reviewedSubmissionCount,
      submissionCompletionRate: calculateSubmissionCompletionRate(
        metrics.submissionCount,
        enrolledStudentCount,
        totalLearningTasks,
      ),
    }
  })
}

export const getInstructorAnalytics = async (
  instructorId,
  database = prisma,
) => {
  const courses = await database.course.findMany({
    where: { instructorId },
    select: instructorCourseSelect,
    orderBy: { createdAt: 'desc' },
  })

  return {
    courses: await buildInstructorCourseMetrics(
      courses,
      instructorId,
      database,
    ),
  }
}

export const getInstructorCourseAnalytics = async (
  instructorId,
  courseId,
  database = prisma,
) => {
  const course = await database.course.findUnique({
    where: { id: courseId },
    select: instructorCourseSelect,
  })
  assertCourseOwnership(course, instructorId)

  const [courseAnalytics] = await buildInstructorCourseMetrics(
    [course],
    instructorId,
    database,
  )
  const enrollments = await database.enrollment.findMany({
    where: { courseId },
    select: {
      student: {
        select: {
          id: true,
          name: true,
          xp: true,
          level: true,
          _count: { select: { badges: true } },
        },
      },
    },
    orderBy: [
      { student: { xp: 'desc' } },
      { student: { createdAt: 'asc' } },
      { studentId: 'asc' },
    ],
    take: 5,
  })

  return {
    course: courseAnalytics,
    topStudents: enrollments.map(({ student }, index) => ({
      rank: index + 1,
      id: student.id,
      name: student.name,
      xp: student.xp,
      level: student.level,
      badgeCount: student._count.badges,
    })),
  }
}
