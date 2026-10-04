import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { TaskSubmissionCard } from '../../components/TaskSubmissionCard.jsx'
import { studentCourseApi } from '../../services/course.service.js'

export function LearningPage() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentCourseApi.learning(courseId).then((response) => setCourse(response.data.course)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [courseId])

  if (loading) return <PageLoader label="Loading course content..." />
  if (!course) return <Alert>{error || 'Course content was not found.'}</Alert>

  return (
    <div className="space-y-8">
      <header className="surface-card flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <Link className="back-link" to="/student/enrolled"><Icon name="arrowLeft" className="h-4 w-4" />My courses</Link>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-violet-600">Learning workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">{course.title}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">With {course.instructor.name}</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl bg-violet-50 px-4 py-3 text-center"><p className="text-xl font-black text-violet-800">{course.lessons.length}</p><p className="text-xs font-bold text-violet-600">Lessons</p></div>
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-center"><p className="text-xl font-black text-slate-900">{course.learningTasks.length}</p><p className="text-xs font-bold text-slate-500">Tasks</p></div>
        </div>
      </header>
      <Alert>{error}</Alert>

      <section className="space-y-4">
        <SectionHeading icon="book" eyebrow="Course content" title="Lessons" />
        {course.lessons.length === 0 ? (
          <EmptyState title="No lessons yet" message="Your instructor has not added lessons to this course." icon="book" />
        ) : (
          <div className="space-y-3">
            {course.lessons.map((lesson, index) => (
              <details key={lesson.id} className="surface-card group overflow-hidden" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-black text-slate-950">{lesson.title}</span>
                  <Icon name="chevronDown" className="h-5 w-5 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="whitespace-pre-wrap border-t border-slate-100 bg-slate-50/60 px-5 py-5 text-sm leading-7 text-slate-700 sm:px-6">{lesson.content}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading icon="target" eyebrow="Apply your learning" title="Learning tasks" />
        {course.learningTasks.length === 0 ? (
          <EmptyState title="No tasks yet" message="Learning tasks will appear here when your instructor adds them." icon="target" />
        ) : (
          <div className="space-y-5">{course.learningTasks.map((task) => <TaskSubmissionCard key={task.id} task={task} />)}</div>
        )}
      </section>
    </div>
  )
}

function SectionHeading({ icon, eyebrow, title }) {
  return (
    <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name={icon} className="h-5 w-5" /></span><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-600">{eyebrow}</p><h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2></div></div>
  )
}

