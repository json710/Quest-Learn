import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { BadgeCard } from '../../components/BadgeCard.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { LeaderboardRow } from '../../components/LeaderboardRow.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { ProgressBar } from '../../components/ProgressBar.jsx'
import { StatCard } from '../../components/StatCard.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { badgeApi } from '../../services/badge.service.js'
import { studentCourseApi } from '../../services/course.service.js'
import { leaderboardApi } from '../../services/leaderboard.service.js'
import { studentSubmissionApi } from '../../services/submission.service.js'

const XP_PER_LEVEL = 100

export function StudentDashboardPage() {
  const { user, refreshUser } = useAuth()
  const [data, setData] = useState({ enrollments: [], submissions: [], badges: [], leaders: [], currentRank: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      studentCourseApi.enrolled(),
      studentSubmissionApi.list(),
      badgeApi.earned(),
      leaderboardApi.get(),
      refreshUser(),
    ])
      .then(([courses, submissions, badges, leaderboard]) => {
        setData({
          enrollments: courses.data.enrollments,
          submissions: submissions.data.submissions,
          badges: badges.data.badges,
          leaders: leaderboard.data.leaders.slice(0, 3),
          currentRank: leaderboard.data.currentUser.rank,
        })
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [refreshUser])

  if (loading) return <PageLoader label="Loading your dashboard..." />

  const reviewed = data.submissions.filter((submission) => submission.status === 'REVIEWED').length
  const xp = user.xp ?? 0
  const level = user.level ?? 1
  const levelXp = xp % XP_PER_LEVEL
  const xpRemaining = XP_PER_LEVEL - levelXp

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-violet-700 px-6 py-7 text-white shadow-[0_12px_36px_rgba(91,33,182,0.18)] sm:px-8 sm:py-9">
        <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full border-[32px] border-white/5" />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_320px] lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-violet-100 ring-1 ring-white/15">
              <Icon name="sparkles" className="h-4 w-4" /> Student workspace
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] sm:text-4xl">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">Pick up where you left off, complete your learning tasks, and turn instructor feedback into progress.</p>
            <Link className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-violet-700 shadow-sm transition hover:bg-violet-50" to="/student/courses">
              Browse courses <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-violet-200">Your progress</p>
                <p className="mt-1 text-2xl font-black">Level {level}</p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-violet-700 shadow-sm"><Icon name="trophy" className="h-6 w-6" /></span>
            </div>
            <ProgressBar className="mt-5" value={levelXp} label={`${levelXp} / ${XP_PER_LEVEL} XP`} detail={`${xpRemaining} XP to next level`} tone="inverse" />
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-violet-100">
              <span>Total earned: {xp} XP</span>
              <span>{XP_PER_LEVEL} XP per level</span>
            </div>
          </div>
        </div>
      </section>

      <Alert>{error}</Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled courses" value={data.enrollments.length} icon="book" accent="violet" />
        <StatCard label="Task submissions" value={data.submissions.length} icon="clipboard" accent="blue" />
        <StatCard label="Reviewed work" value={reviewed} icon="check" accent="emerald" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Top learners</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Leaderboard preview</h2>
            {data.currentRank && <p className="mt-1 text-xs font-semibold text-slate-500">Your current rank is #{data.currentRank}</p>}
          </div>
          <Link className="text-link" to="/student/leaderboard">Full leaderboard <Icon name="arrowRight" className="h-4 w-4" /></Link>
        </div>
        <div className="surface-card space-y-2 p-3 sm:p-4">
          {data.leaders.map((entry) => <LeaderboardRow key={entry.id} entry={entry} isCurrent={entry.id === user.id} compact />)}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Your learning</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Continue learning</h2>
          </div>
          <Link className="text-link" to="/student/enrolled">View all <Icon name="arrowRight" className="h-4 w-4" /></Link>
        </div>
        {data.enrollments.length === 0 ? (
          <EmptyState title="No enrolled courses yet" message="Browse the course catalog and enroll to start learning." icon="book" action={<Link className="btn-primary" to="/student/courses">Browse courses</Link>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.enrollments.slice(0, 4).map((enrollment) => {
              const course = enrollment.course
              const itemCount = course._count.lessons + course._count.learningTasks
              return (
                <Link key={enrollment.id} className="surface-card group flex items-center gap-4 p-4 transition hover:border-violet-200 hover:shadow-md sm:p-5" to={`/student/courses/${course.id}/learning`}>
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700 transition group-hover:bg-violet-600 group-hover:text-white"><Icon name="book" className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-violet-600">Continue course</p>
                    <h3 className="mt-1 truncate font-black text-slate-950">{course.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{course._count.lessons} lessons · {course._count.learningTasks} tasks · {itemCount} items</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-400 transition group-hover:bg-violet-50 group-hover:text-violet-700"><Icon name="arrowRight" className="h-4 w-4" /></span>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Milestones</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Recent achievements</h2>
          </div>
          <Link className="text-link" to="/student/badges">View badges <Icon name="arrowRight" className="h-4 w-4" /></Link>
        </div>
        {data.badges.length === 0 ? (
          <EmptyState title="Your first badge is waiting" message="Submit a quiz or complete a reviewed task to unlock an achievement." icon="badge" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.badges.slice(0, 3).map((achievement) => <BadgeCard key={achievement.badge.id} badge={achievement.badge} earnedAt={achievement.earnedAt} compact />)}
          </div>
        )}
      </section>
    </div>
  )
}
