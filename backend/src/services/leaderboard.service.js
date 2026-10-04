import { prisma } from '../config/database.js'
import { AppError } from '../utils/app-error.js'

export const DEFAULT_LEADERBOARD_LIMIT = 10

const leaderboardStudentSelect = {
  id: true,
  name: true,
  xp: true,
  level: true,
  createdAt: true,
  _count: { select: { badges: true } },
}

const leaderboardOrder = [
  { xp: 'desc' },
  { createdAt: 'asc' },
  { id: 'asc' },
]

const serializeEntry = (student, rank) => ({
  rank,
  id: student.id,
  name: student.name,
  xp: student.xp,
  level: student.level,
  badgeCount: student._count.badges,
})

const studentsAheadOf = (student) => ({
  role: 'STUDENT',
  OR: [
    { xp: { gt: student.xp } },
    { xp: student.xp, createdAt: { lt: student.createdAt } },
    {
      xp: student.xp,
      createdAt: student.createdAt,
      id: { lt: student.id },
    },
  ],
})

export const getStudentLeaderboard = async (
  studentId,
  limit = DEFAULT_LEADERBOARD_LIMIT,
  database = prisma,
) => {
  const [leaders, currentStudent] = await Promise.all([
    database.user.findMany({
      where: { role: 'STUDENT' },
      select: leaderboardStudentSelect,
      orderBy: leaderboardOrder,
      take: limit,
    }),
    database.user.findFirst({
      where: { id: studentId, role: 'STUDENT' },
      select: leaderboardStudentSelect,
    }),
  ])

  if (!currentStudent) {
    throw new AppError(404, 'Student was not found', 'STUDENT_NOT_FOUND')
  }

  const studentsAhead = await database.user.count({
    where: studentsAheadOf(currentStudent),
  })

  return {
    leaders: leaders.map((student, index) => serializeEntry(student, index + 1)),
    currentUser: serializeEntry(currentStudent, studentsAhead + 1),
  }
}
