import { Link } from 'react-router-dom'

import { Icon } from './Icon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function QuizCard({ quiz, to, actionLabel = 'Open quiz', onDelete }) {
  const questionCount = quiz._count?.questions ?? quiz.questions?.length ?? 0

  return (
    <article className="surface-card group flex h-full flex-col p-5 transition hover:border-violet-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-700"><Icon name="quiz" className="h-5 w-5" /></span>
        {quiz.isPublished !== undefined && <StatusBadge status={quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}>{quiz.isPublished ? 'Published' : 'Draft'}</StatusBadge>}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-wide text-violet-600">{quiz.course?.title ?? quiz.lesson?.title ?? 'Course quiz'}</p>
      <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 group-hover:text-violet-800">{quiz.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{quiz.description}</p>
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500"><Icon name="file" className="h-4 w-4 text-violet-500" />{questionCount} {questionCount === 1 ? 'question' : 'questions'}{quiz.lesson && <><span>·</span><span>{quiz.lesson.title}</span></>}</div>
      <div className="mt-4 flex gap-2">
        <Link className="btn-secondary flex-1 gap-2" to={to}>{actionLabel}<Icon name="arrowRight" className="h-4 w-4" /></Link>
        {onDelete && <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-rose-200 px-3 text-sm font-bold text-rose-700 transition hover:bg-rose-50" type="button" onClick={() => onDelete(quiz)}>Delete</button>}
      </div>
    </article>
  )
}
