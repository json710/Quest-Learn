import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { studentSubmissionApi } from '../../services/submission.service.js'
import { formatDate } from '../../utils/format.js'

export function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    studentSubmissionApi.list().then((response) => setSubmissions(response.data.submissions)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading submissions..." />

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="My work" title="Task submissions" description="Track submitted work and turn instructor feedback into your next step." />
      <Alert>{error}</Alert>
      {submissions.length === 0 ? (
        <EmptyState title="No submissions yet" message="Open an enrolled course and complete a learning task." icon="clipboard" action={<Link className="btn-primary" to="/student/enrolled">Open my courses</Link>} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {submissions.map((submission) => {
            const reviewed = submission.status === 'REVIEWED'
            return (
              <article key={submission.id} className="surface-card flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="clipboard" className="h-5 w-5" /></span>
                  <StatusBadge status={submission.status}>{reviewed ? 'Reviewed' : 'Awaiting review'}</StatusBadge>
                </div>
                <p className="mt-5 text-xs font-black uppercase tracking-wide text-violet-600">{submission.learningTask.course.title}</p>
                <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">{submission.learningTask.title}</h2>
                <p className="mt-2 text-xs font-medium text-slate-500">Submitted {formatDate(submission.submittedAt)}</p>

                {reviewed ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-[110px_1fr]">
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center"><p className="text-3xl font-black tracking-tight text-emerald-800">{submission.score}</p><p className="text-xs font-bold text-emerald-700">out of 100</p></div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Instructor feedback</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-emerald-900">{submission.feedback || 'No written feedback provided.'}</p></div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Your work is submitted and ready for instructor review. You can still update it from the learning workspace.</div>
                )}
                {submission.xpReward && <p className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-violet-100 px-3 py-1.5 text-xs font-black text-violet-700"><Icon name="sparkles" className="h-3.5 w-3.5" />+{submission.xpReward.amount} XP earned</p>}
                {submission.earnedBadges?.length > 0 && <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-violet-700"><Icon name="badge" className="h-4 w-4" />Achievement: {submission.earnedBadges.map((achievement) => achievement.badge.name).join(', ')}</p>}
                <Link className="text-link mt-5 border-t border-slate-100 pt-4" to={`/student/courses/${submission.learningTask.course.id}/learning`}>Open task <Icon name="arrowRight" className="h-4 w-4" /></Link>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
