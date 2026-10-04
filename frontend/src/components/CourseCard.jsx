import { Link } from 'react-router-dom'

import { excerpt } from '../utils/format.js'
import { Icon } from './Icon.jsx'
import { StatusBadge } from './StatusBadge.jsx'

const coverStyles = ['bg-violet-600', 'bg-indigo-600', 'bg-fuchsia-700', 'bg-slate-800']

const coverFor = (title) => {
  const value = [...title].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return coverStyles[value % coverStyles.length]
}

export function CourseCard({ course, to, label = 'View course' }) {
  const lessonCount = course._count?.lessons ?? course.lessons?.length ?? 0
  const taskCount = course._count?.learningTasks ?? course.learningTasks?.length ?? 0
  const totalContent = lessonCount + taskCount

  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_32px_rgba(76,29,149,0.10)]">
      <div className={`relative h-28 overflow-hidden p-5 text-white ${coverFor(course.title)}`}>
        <div className="absolute -top-10 -right-8 h-28 w-28 rounded-full border-[20px] border-white/10" />
        <div className="relative flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"><Icon name="book" className="h-5 w-5" /></span>
          <StatusBadge status={course.isPublished ? 'PUBLISHED' : 'DRAFT'}>{course.isPublished ? 'Published' : 'Draft'}</StatusBadge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Icon name="file" className="h-4 w-4 text-violet-500" />{lessonCount} lessons</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" /><span>{taskCount} tasks</span>
        </div>
        <h2 className="mt-3 text-lg font-black leading-snug tracking-tight text-slate-950 group-hover:text-violet-800">{course.title}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{excerpt(course.description)}</p>
        {course.instructor && (
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-[10px] font-black text-violet-700">{course.instructor.name.slice(0, 1).toUpperCase()}</span>
            <span className="text-xs font-semibold text-slate-500">{course.instructor.name}</span>
          </div>
        )}
        {!course.instructor && totalContent > 0 && <div className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">{totalContent} learning items ready</div>}
        <Link className="mt-4 inline-flex items-center justify-between rounded-xl bg-violet-50 px-3.5 py-2.5 text-sm font-bold text-violet-700 transition group-hover:bg-violet-100" to={to}>
          {label}<Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </article>
  )
}
