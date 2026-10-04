import { useEffect, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { AnalyticsBarChart } from '../../components/AnalyticsBarChart.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatCard } from '../../components/StatCard.jsx'
import { studentAnalyticsApi } from '../../services/analytics.service.js'

export function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentAnalyticsApi
      .get()
      .then((response) => setAnalytics(response.data))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading your analytics..." />
  if (!analytics) return <Alert>{error || 'Analytics could not be loaded.'}</Alert>

  const { summary, recentQuizScores, courseProgress } = analytics

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Learning insights" title="Your analytics" description="A simple view of your progress across courses, quizzes, tasks, XP, and achievements." />
      <Alert>{error}</Alert>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current level" value={summary.level} icon="trophy" accent="violet" />
        <StatCard label="Total XP" value={summary.xp.toLocaleString()} icon="sparkles" accent="violet" />
        <StatCard label="Earned badges" value={summary.earnedBadgeCount} icon="badge" accent="amber" />
        <StatCard label="Enrolled courses" value={summary.enrolledCourseCount} icon="book" accent="blue" />
        <StatCard label="Quizzes completed" value={summary.quizzesCompleted} icon="quiz" accent="blue" />
        <StatCard label="Average quiz score" value={`${summary.averageQuizScore}%`} icon="chart" accent="emerald" />
        <StatCard label="Tasks submitted" value={summary.learningTasksSubmitted} icon="target" accent="emerald" />
        <StatCard label="Reviewed tasks" value={summary.reviewedTasks} icon="check" accent="amber" />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface-card p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Recent results</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Quiz scores</h2>
          <p className="mt-1 text-sm text-slate-500">Your ten most recent completed attempts.</p>
          <div className="mt-6"><AnalyticsBarChart data={recentQuizScores} labelKey="quizTitle" valueKey="score" maxValue={100} suffix="%" emptyMessage="Complete a quiz to see score history." /></div>
        </section>

        <section className="surface-card p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Trackable activities</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Course progress</h2>
          <p className="mt-1 text-sm text-slate-500">Submitted tasks and completed published quizzes.</p>
          <div className="mt-6"><AnalyticsBarChart data={courseProgress} labelKey="title" valueKey="progressPercentage" maxValue={100} suffix="%" emptyMessage="Enroll in a course to see progress." /></div>
        </section>
      </div>
    </div>
  )
}
