import { useEffect, useState } from 'react'

import { studentSubmissionApi } from '../services/submission.service.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatDate } from '../utils/format.js'
import { Alert } from './Alert.jsx'
import { Button } from './Button.jsx'
import { Icon } from './Icon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function TaskSubmissionCard({ task }) {
  const { refreshUser } = useAuth()
  const [submission, setSubmission] = useState(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    studentSubmissionApi
      .forTask(task.id)
      .then((response) => {
        setSubmission(response.data.submission)
        setContent(response.data.submission.content)
        if (response.data.submission.status === 'REVIEWED') {
          refreshUser().catch(() => {})
        }
      })
      .catch((requestError) => {
        if (requestError.status !== 404) setError(requestError.message)
      })
      .finally(() => setLoading(false))
  }, [refreshUser, task.id])

  const handleSave = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!content.trim()) {
      setError('Submission content is required.')
      return
    }

    setSaving(true)
    try {
      const response = submission
        ? await studentSubmissionApi.update(submission.id, content)
        : await studentSubmissionApi.submit(task.id, content)
      setSubmission(response.data.submission)
      setContent(response.data.submission.content)
      setSuccess(submission ? 'Submission updated.' : 'Work submitted successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const reviewed = submission?.status === 'REVIEWED'

  return (
    <article className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="target" className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-violet-600">Learning task {task.position + 1}</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">{task.title}</h3>
            </div>
          </div>
          {submission && <StatusBadge status={submission.status}>{reviewed ? 'Reviewed' : 'Submitted'}</StatusBadge>}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{task.description}</p>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />Checking your submission...</div>
        ) : reviewed ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Your response</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.content}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Your score</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-emerald-900">{submission.score}<span className="text-base text-emerald-700">/100</span></p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-700"><Icon name="trophy" className="h-5 w-5" /></span>
              </div>
              <div className="mt-4 border-t border-emerald-200 pt-3">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Instructor feedback</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-900">{submission.feedback}</p>
                <p className="mt-3 text-xs font-medium text-emerald-700">Reviewed {formatDate(submission.reviewedAt)}</p>
                {submission.xpReward && <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-black text-violet-700"><Icon name="sparkles" className="h-3.5 w-3.5" />+{submission.xpReward.amount} XP earned</p>}
                {submission.earnedBadges?.length > 0 && <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-violet-700"><Icon name="badge" className="h-4 w-4" />Achievement unlocked: {submission.earnedBadges.map((achievement) => achievement.badge.name).join(', ')}</p>}
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSave}>
            <label className="block text-sm font-bold text-slate-700" htmlFor={`task-${task.id}`}>{submission ? 'Update your response' : 'Your response'}</label>
            <textarea id={`task-${task.id}`} className="form-input min-h-40 resize-y" maxLength={50000} value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your response here..." />
            <Alert>{error}</Alert><Alert type="success">{success}</Alert>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">{submission ? 'You can edit until an instructor reviews it.' : 'Text submissions only.'}</p>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : submission ? 'Save update' : 'Submit work'}</Button>
            </div>
          </form>
        )}
        {!loading && reviewed && <Alert>{error}</Alert>}
      </div>
    </article>
  )
}
