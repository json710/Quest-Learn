import { Icon } from './Icon.jsx'

const initialsFor = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export function LeaderboardRow({ entry, isCurrent = false, compact = false }) {
  return (
    <article className={`grid items-center gap-3 rounded-xl border ${compact ? 'grid-cols-[36px_minmax(0,1fr)_auto] px-3 py-3' : 'grid-cols-[44px_minmax(0,1fr)_auto] px-4 py-4 sm:grid-cols-[56px_minmax(0,1fr)_80px_100px_90px] sm:px-5'} ${isCurrent ? 'border-violet-300 bg-violet-50 ring-2 ring-violet-100' : 'border-slate-200 bg-white'}`}>
      <span className={`text-center font-black ${entry.rank <= 3 ? 'text-violet-700' : 'text-slate-500'}`}>#{entry.rank}</span>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid shrink-0 place-items-center rounded-xl text-xs font-black ${compact ? 'h-9 w-9' : 'h-10 w-10'} ${isCurrent ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{initialsFor(entry.name)}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-950">{entry.name}{isCurrent && <span className="ml-2 text-xs text-violet-600">You</span>}</p>
          <p className={`mt-0.5 text-xs font-semibold text-slate-400 ${compact ? '' : 'sm:hidden'}`}>Level {entry.level} · {entry.badgeCount} badges</p>
        </div>
      </div>
      <p className={`text-right text-sm font-black text-violet-700 ${compact ? '' : 'sm:hidden'}`}>{entry.xp.toLocaleString()} XP</p>
      {!compact && <><p className="hidden text-center text-sm font-bold text-slate-600 sm:block">Level {entry.level}</p><p className="hidden text-right text-sm font-black text-violet-700 sm:block">{entry.xp.toLocaleString()} XP</p><p className="hidden items-center justify-end gap-1.5 text-sm font-bold text-slate-600 sm:flex"><Icon name="badge" className="h-4 w-4 text-violet-500" />{entry.badgeCount}</p></>}
    </article>
  )
}
