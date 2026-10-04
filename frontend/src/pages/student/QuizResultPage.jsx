import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { studentQuizApi } from '../../services/quiz.service.js'
import { formatDate } from '../../utils/format.js'

export function QuizResultPage() {
  const { attemptId } = useParams()
  const location = useLocation()
  const { refreshUser } = useAuth()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([studentQuizApi.result(attemptId), refreshUser()])
      .then(([response]) => setAttempt(response.data.attempt))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [attemptId, refreshUser])

  if (loading) return <PageLoader label="Loading quiz result..." />
  if (!attempt) return <Alert>{error || 'Quiz result was not found.'}</Alert>

  const strongScore = attempt.score >= 70
  const newlyEarnedBadges = location.state?.newlyEarnedBadges ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link className="back-link" to="/student/quizzes"><Icon name="arrowLeft" className="h-4 w-4" />All quizzes</Link>
      {newlyEarnedBadges.length > 0 && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5 text-violet-900 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white"><Icon name="badge" className="h-5 w-5" /></span>
            <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Achievement unlocked</p><p className="mt-1 font-black">{newlyEarnedBadges.map((badge) => badge.name).join(', ')}</p></div>
          </div>
        </section>
      )}
      <section className="surface-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Quiz completed</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{attempt.quiz.title}</h1><p className="mt-2 text-sm text-slate-500">Submitted {formatDate(attempt.submittedAt)} · {attempt.quiz.course.title}</p>{attempt.xpReward && <div className="mt-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-black text-violet-700"><Icon name="sparkles" className="h-4 w-4" />+{attempt.xpReward.amount} XP</span>{attempt.xpReward.levelUp && <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800">Level Up! Level {attempt.xpReward.levelAfter}</span>}</div>}</div><div className={'grid h-28 w-28 shrink-0 place-items-center rounded-3xl ' + (strongScore ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}><div className="text-center"><p className="text-4xl font-black tracking-tight">{attempt.score}%</p><p className="text-xs font-black uppercase tracking-wide">Score</p></div></div></section>
      {attempt.earnedBadges?.length > 0 && (
        <p className="text-sm font-semibold text-slate-500">Achievements from this attempt: <span className="text-violet-700">{attempt.earnedBadges.map((achievement) => achievement.badge.name).join(', ')}</span></p>
      )}
      <div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Answer review</p><h2 className="mt-1 text-xl font-black text-slate-950">Review your answers</h2></div>
      {attempt.quiz.questions.map((question, index) => {
        const selectedOption = question.options.find((option) => option.id === question.selectedOptionId)
        const answeredCorrectly = selectedOption?.isCorrect
        return (
          <section key={question.id} className="surface-card p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">{index + 1}</span><h3 className="pt-1 font-black leading-6 text-slate-950">{question.text}</h3></div><span className={'rounded-full px-3 py-1 text-xs font-black ' + (answeredCorrectly ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{answeredCorrectly ? 'Correct' : 'Incorrect'}</span></div>
            <div className="mt-5 space-y-2">{question.options.map((option) => {
              const selected = option.id === question.selectedOptionId
              const style = option.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : selected ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-slate-50 text-slate-600'
              return <div key={option.id} className={'flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-semibold ' + style}><span>{option.text}</span><span className="text-xs font-black uppercase tracking-wide">{option.isCorrect ? 'Correct answer' : selected ? 'Your answer' : ''}</span></div>
            })}</div>
          </section>
        )
      })}
    </div>
  )
}
