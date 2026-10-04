import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatCard } from '../../components/StatCard.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { adminApi } from '../../services/admin.service.js'

export function AdminDashboardPage() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .overview()
      .then((response) => setSummary(response.data.summary))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading system overview..." />
  if (!summary) return <Alert>{error || 'System overview could not be loaded.'}</Alert>

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-violet-600" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-violet-700"><Icon name="shield" className="h-4 w-4" />Admin workspace</div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Manage account access and review a concise overview of the QuestLearn system.</p>
          </div>
          <Link className="btn-primary shrink-0 gap-2" to="/admin/users"><Icon name="users" className="h-4 w-4" />Manage users</Link>
        </div>
      </section>

      <Alert>{error}</Alert>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={summary.totalUsers} icon="users" accent="violet" />
        <StatCard label="Students" value={summary.totalStudents} icon="book" accent="blue" />
        <StatCard label="Instructors" value={summary.totalInstructors} icon="shield" accent="emerald" />
        <StatCard label="Courses" value={summary.totalCourses} icon="layers" accent="amber" />
        <StatCard label="Enrollments" value={summary.totalEnrollments} icon="users" accent="blue" />
        <StatCard label="Quizzes" value={summary.totalQuizzes} icon="quiz" accent="violet" />
        <StatCard label="Quiz attempts" value={summary.totalQuizAttempts} icon="chart" accent="emerald" />
        <StatCard label="Task submissions" value={summary.totalTaskSubmissions} icon="clipboard" accent="amber" />
      </section>
    </div>
  )
}
