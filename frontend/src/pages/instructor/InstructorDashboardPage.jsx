import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatCard } from '../../components/StatCard.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { instructorCourseApi } from '../../services/course.service.js'

export function InstructorDashboardPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    instructorCourseApi.list().then((response) => setCourses(response.data.courses)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading instructor dashboard..." />

  const totals = courses.reduce((sum, course) => ({ students: sum.students + course._count.enrollments, lessons: sum.lessons + course._count.lessons, tasks: sum.tasks + course._count.learningTasks }), { students: 0, lessons: 0, tasks: 0 })

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="surface-card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-violet-600" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-violet-700"><Icon name="sparkles" className="h-4 w-4" />Instructor workspace</div>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Build focused course experiences and give students useful, timely feedback.</p>
          </div>
          <Link className="btn-primary shrink-0 gap-2" to="/instructor/courses/new"><Icon name="plus" className="h-4 w-4" />Create course</Link>
        </div>
      </section>
      <Alert>{error}</Alert>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses" value={courses.length} icon="layers" accent="violet" />
        <StatCard label="Enrollments" value={totals.students} icon="users" accent="blue" />
        <StatCard label="Lessons" value={totals.lessons} icon="book" accent="emerald" />
        <StatCard label="Learning tasks" value={totals.tasks} icon="target" accent="amber" />
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Course activity</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Recent courses</h2></div>
          <Link className="text-link" to="/instructor/courses">View all <Icon name="arrowRight" className="h-4 w-4" /></Link>
        </div>
        {courses.length === 0 ? (
          <EmptyState title="Create your first course" message="Add a course, then build its lessons and learning tasks." icon="book" action={<Link className="btn-primary" to="/instructor/courses/new">Create course</Link>} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.slice(0, 4).map((course) => (
              <Link key={course.id} className="surface-card group p-5 transition hover:border-violet-200 hover:shadow-md" to={`/instructor/courses/${course.id}`}>
                <div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="book" className="h-5 w-5" /></span><StatusBadge status={course.isPublished ? 'PUBLISHED' : 'DRAFT'}>{course.isPublished ? 'Published' : 'Draft'}</StatusBadge></div>
                <h3 className="mt-4 font-black text-slate-950 group-hover:text-violet-800">{course.title}</h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{course._count.enrollments} students · {course._count.lessons} lessons · {course._count.learningTasks} tasks</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

