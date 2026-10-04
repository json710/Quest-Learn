import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { Button } from '../../components/Button.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { studentQuizApi } from '../../services/quiz.service.js'

export function QuizAttemptPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [attempt, setAttempt] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    studentQuizApi.details(quizId).then((response) => setQuiz(response.data.quiz)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false))
  }, [quizId])

  const startQuiz = async () => {
    setError('')
    setStarting(true)
    try {
      const response = await studentQuizApi.start(quizId)
      setAttempt(response.data.attempt)
      setQuiz(response.data.quiz)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setStarting(false)
    }
  }

  const submitQuiz = async (event) => {
    event.preventDefault()
    setError('')
    const unanswered = quiz.questions.length - Object.keys(answers).length
    if (unanswered > 0) {
      setError('Answer all questions before submitting. ' + unanswered + ' remaining.')
      return
    }
    if (!window.confirm('Submit this quiz? You cannot change your answers afterward.')) return

    setSubmitting(true)
    try {
      const response = await studentQuizApi.submit(attempt.id, Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })))
      navigate('/student/quiz-attempts/' + attempt.id, {
        replace: true,
        state: { newlyEarnedBadges: response.data.attempt.newlyEarnedBadges },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader label="Loading quiz..." />
  if (!quiz) return <Alert>{error || 'Quiz was not found.'}</Alert>

  if (!attempt) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Link className="back-link" to="/student/quizzes"><Icon name="arrowLeft" className="h-4 w-4" />All quizzes</Link>
        <section className="surface-card overflow-hidden">
          <div className="bg-violet-700 p-7 text-white sm:p-10"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Icon name="quiz" className="h-6 w-6" /></span><p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-violet-200">{quiz.course.title}</p><h1 className="mt-2 text-3xl font-black tracking-[-0.03em] sm:text-4xl">{quiz.title}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-violet-100 sm:text-base">{quiz.description}</p></div>
          <div className="p-6 sm:p-8"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Questions</p><p className="mt-1 text-2xl font-black text-slate-950">{quiz.questions.length}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Format</p><p className="mt-1 font-black text-slate-950">Multiple choice</p></div></div><Alert>{error}</Alert><div className="mt-6 flex justify-end"><Button onClick={startQuiz} disabled={starting}>{starting ? 'Starting...' : 'Start quiz'}</Button></div></div>
        </section>
      </div>
    )
  }

  const progress = (Object.keys(answers).length / quiz.questions.length) * 100

  return (
    <form className="mx-auto max-w-4xl space-y-6" onSubmit={submitQuiz}>
      <header className="surface-card p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-wide text-violet-600">Quiz in progress</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{quiz.title}</h1><p className="mt-2 text-sm text-slate-500">Choose one answer for every question.</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600 transition-[width]" style={{ width: String(progress) + '%' }} /></div><p className="mt-2 text-xs font-bold text-slate-500">{Object.keys(answers).length} of {quiz.questions.length} answered</p></header>
      {quiz.questions.map((question, index) => (
        <fieldset key={question.id} className="surface-card p-5 sm:p-7"><legend className="sr-only">Question {index + 1}</legend><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700">{index + 1}</span><h2 className="pt-1 text-lg font-black leading-7 text-slate-950">{question.text}</h2></div><div className="mt-5 space-y-3">{question.options.map((option) => <label key={option.id} className={'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ' + (answers[question.id] === option.id ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-100' : 'border-slate-200 bg-white hover:border-violet-200')}><input className="h-4 w-4 accent-violet-600" type="radio" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => setAnswers({ ...answers, [question.id]: option.id })} /><span className="text-sm font-semibold text-slate-700">{option.text}</span></label>)}</div></fieldset>
      ))}
      <Alert>{error}</Alert><div className="surface-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-500">Submitting locks this attempt and reveals your results.</p><Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit quiz'}</Button></div>
    </form>
  )
}
