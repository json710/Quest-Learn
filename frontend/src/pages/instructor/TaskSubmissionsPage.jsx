import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { instructorCourseApi } from '../../services/course.service.js'
import { instructorSubmissionApi } from '../../services/submission.service.js'
import { formatDate } from '../../utils/format.js'

export function TaskSubmissionsPage() {
  const { taskId } = useParams()
  const [task, setTask] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([instructorCourseApi.taskDetails(taskId), instructorSubmissionApi.forTask(taskId)])
      .then(([taskResponse, submissionResponse]) => { setTask(taskResponse.data.learningTask); setSubmissions(submissionResponse.data.submissions) })
      .catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [taskId])

  if (loading) return <PageLoader label="Loading task submissions..." />

  const reviewedCount = submissions.filter((submission) => submission.status === 'REVIEWED').length

  return (
    <div className="space-y-7">
      <Link className="back-link" to={task ? `/instructor/courses/${task.courseId}` : '/instructor/courses'}><Icon name="arrowLeft" className="h-4 w-4" />Back to course</Link>
      <PageHeader eyebrow="Student work" title={task?.title || 'Task submissions'} description="Review submitted responses and provide a score and constructive feedback." />
      <Alert>{error}</Alert>
      {submissions.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p><p className="mt-1 text-2xl font-black text-slate-950">{submissions.length}</p></div>
          <div className="surface-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Reviewed</p><p className="mt-1 text-2xl font-black text-slate-950">{reviewedCount}</p></div>
          <div className="surface-card p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-600">Needs review</p><p className="mt-1 text-2xl font-black text-slate-950">{submissions.length - reviewedCount}</p></div>
        </div>
      )}
      {submissions.length === 0 ? (
        <EmptyState title="No submissions yet" message="Student work for this task will appear here." icon="clipboard" />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="divide-y divide-slate-100">
            {submissions.map((submission) => {
              const reviewed = submission.status === 'REVIEWED'
              const initials = submission.student.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
              return (
                <Link key={submission.id} className="group flex flex-col gap-4 p-5 transition hover:bg-violet-50/50 sm:flex-row sm:items-center sm:justify-between sm:p-6" to={`/instructor/submissions/${submission.id}`}>
                  <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-black text-slate-700 group-hover:bg-violet-100 group-hover:text-violet-700">{initials}</span><div><p className="font-black text-slate-950">{submission.student.name}</p><p className="mt-1 text-xs font-medium text-slate-500">Submitted {formatDate(submission.submittedAt)}</p></div></div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">{reviewed && <div className="text-right"><p className="text-xl font-black text-slate-950">{submission.score}<span className="text-sm text-slate-400">/100</span></p><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Score</p></div>}<StatusBadge status={submission.status}>{reviewed ? 'Reviewed' : 'Needs review'}</StatusBadge><Icon name="arrowRight" className="hidden h-4 w-4 text-slate-400 sm:block" /></div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

