import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { FormField } from '../../components/FormField.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { instructorSubmissionApi } from '../../services/submission.service.js'
import { formatDate } from '../../utils/format.js'

export function ReviewSubmissionPage() {
  const { submissionId } = useParams()
  const [submission, setSubmission] = useState(null)
  const [form, setForm] = useState({ score: '', feedback: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    instructorSubmissionApi.details(submissionId).then((response) => {
      const result = response.data.submission
      setSubmission(result)
      setForm({ score: result.score ?? '', feedback: result.feedback ?? '' })
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [submissionId])

  const handleReview = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const score = Number(form.score)
    if (!Number.isInteger(score) || score < 0 || score > 100) { setError('Score must be a whole number from 0 to 100.'); return }
    if (!form.feedback.trim()) { setError('Feedback is required.'); return }

    setSaving(true)
    try {
      const response = await instructorSubmissionApi.review(submissionId, { score, feedback: form.feedback })
      setSubmission(response.data.submission)
      setSuccess('Review saved. The student can now see the score and feedback.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading submission..." />
  if (!submission) return <Alert>{error || 'Submission was not found.'}</Alert>

  const reviewed = submission.status === 'REVIEWED'

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link className="back-link" to={`/instructor/tasks/${submission.learningTask.id}/submissions`}><Icon name="arrowLeft" className="h-4 w-4" />Task submissions</Link>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-start">
        <section className="surface-card overflow-hidden">
          <div className="border-b border-slate-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">{submission.learningTask.course.title}</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{submission.learningTask.title}</h1><p className="mt-3 text-sm font-medium text-slate-500">{submission.student.name} · {submission.student.email}</p><p className="mt-1 text-xs text-slate-400">Submitted {formatDate(submission.submittedAt)}</p></div>
              <StatusBadge status={submission.status}>{reviewed ? 'Reviewed' : 'Needs review'}</StatusBadge>
            </div>
          </div>
          <div className="p-6 sm:p-8"><div className="flex items-center gap-2"><Icon name="file" className="h-4 w-4 text-violet-600" /><p className="text-xs font-black uppercase tracking-wide text-slate-500">Student response</p></div><p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-800">{submission.content}</p></div>
        </section>

        <form className="surface-card space-y-5 p-6 lg:sticky lg:top-6" onSubmit={handleReview}>
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Evaluation</p><h2 className="mt-1 text-xl font-black text-slate-950">Instructor review</h2></div>{reviewed && <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Icon name="check" className="h-5 w-5" /></span>}</div>
          <Alert>{error}</Alert><Alert type="success">{success}</Alert>
          <FormField label="Score" hint="Whole number from 0 to 100."><div className="relative"><input className="form-input pr-14 text-lg font-black" type="number" min="0" max="100" step="1" required value={form.score} onChange={(event) => setForm({ ...form, score: event.target.value })} /><span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-bold text-slate-400">/ 100</span></div></FormField>
          <FormField label="Feedback"><textarea className="form-input min-h-44 resize-y" maxLength={5000} required value={form.feedback} onChange={(event) => setForm({ ...form, feedback: event.target.value })} placeholder="Share clear, constructive feedback..." /></FormField>
          <Button className="w-full" type="submit" disabled={saving}>{saving ? 'Saving review...' : reviewed ? 'Update review' : 'Submit review'}</Button>
        </form>
      </div>
    </div>
  )
}

