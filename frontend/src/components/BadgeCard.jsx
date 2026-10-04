import { formatDate } from '../utils/format.js'
import { Icon } from './Icon.jsx'

export function BadgeCard({ badge, earnedAt, compact = false }) {
  const earned = Boolean(earnedAt)

  return (
    <article className={`${compact ? 'p-4' : 'p-5 sm:p-6'} rounded-2xl border ${earned ? 'border-violet-200 bg-white shadow-[0_8px_24px_rgba(109,40,217,0.08)]' : 'border-slate-200 bg-slate-50/70'}`}>
      <div className="flex items-start gap-4">
        <span className={`grid shrink-0 place-items-center rounded-2xl ${compact ? 'h-11 w-11' : 'h-14 w-14'} ${earned ? 'bg-violet-600 text-white shadow-sm shadow-violet-200' : 'bg-slate-200 text-slate-400'}`}>
          <Icon name={earned ? badge.iconKey : 'lock'} className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-slate-950`}>{badge.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${earned ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-500'}`}>{earned ? 'Earned' : 'Locked'}</span>
          </div>
          <p className={`mt-1.5 ${compact ? 'text-xs leading-5' : 'text-sm leading-6'} text-slate-600`}>{badge.description}</p>
          <p className="mt-2 text-xs font-semibold text-slate-400">{earned ? `Earned ${formatDate(earnedAt)}` : badge.requirement}</p>
        </div>
      </div>
    </article>
  )
}
