import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { QuizCard } from '../../components/QuizCard.jsx'
import { StatusBadge } from '../../components/StatusBadge.jsx'
import { studentQuizApi } from '../../services/quiz.service.js'
import { formatDate } from '../../utils/format.js'

export function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([studentQuizApi.list(), studentQuizApi.attempts()])
      .then(([quizResponse, attemptResponse]) => {
        setQuizzes(quizResponse.data.quizzes)
        setAttempts(attemptResponse.data.attempts)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading quizzes..." />

  return (
    <div className="space-y-9">
      <PageHeader eyebrow="Knowledge checks" title="Quizzes" description="Test your understanding and review your answers after submission." />
      <Alert>{error}</Alert>
      <section>
        <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="quiz" className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">Ready when you are</p><h2 className="text-xl font-black text-slate-950">Available quizzes</h2></div></div>
        {quizzes.length === 0 ? (
          <EmptyState title="No quizzes available" message="Published quizzes from your enrolled courses will appear here." icon="quiz" />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">{quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} to={'/student/quizzes/' + quiz.id} actionLabel="Take quiz" />)}</div>
        )}
      </section>
      <section>
        <div className="mb-4"><p className="text-xs font-black uppercase tracking-wide text-violet-600">Your history</p><h2 className="mt-1 text-xl font-black text-slate-950">Quiz attempts</h2></div>
        {attempts.length === 0 ? (
          <EmptyState title="No quiz attempts yet" message="Start an available quiz to build your attempt history." icon="clipboard" />
        ) : (
          <div className="surface-card overflow-hidden"><div className="divide-y divide-slate-100">{attempts.map((attempt) => {
            const submitted = Boolean(attempt.submittedAt)
            return <div key={attempt.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-xs font-black uppercase tracking-wide text-violet-600">{attempt.quiz.course.title}</p><h3 className="mt-1 font-black text-slate-950">{attempt.quiz.title}</h3><p className="mt-1 text-xs font-medium text-slate-500">Started {formatDate(attempt.startedAt)} · {attempt.quiz._count.questions} questions</p></div><div className="flex items-center gap-4">{submitted && <p className="text-2xl font-black text-slate-950">{attempt.score}<span className="text-sm text-slate-400">%</span></p>}<StatusBadge status={submitted ? 'REVIEWED' : 'IN_PROGRESS'}>{submitted ? 'Completed' : 'In progress'}</StatusBadge>{submitted && <Link className="text-link" to={'/student/quiz-attempts/' + attempt.id}>Review <Icon name="arrowRight" className="h-4 w-4" /></Link>}</div></div>
          })}</div></div>
        )}
      </section>
    </div>
  )
}
