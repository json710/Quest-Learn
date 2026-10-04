import { Icon } from './Icon.jsx'

const accents = {
  violet: 'bg-violet-100 text-violet-700',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
}

export function StatCard({ label, value, icon = 'sparkles', accent = 'violet', hint }) {
  return (
    <article className="surface-card flex items-center gap-4 p-4 sm:p-5">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accents[accent]}`}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
    </article>
  )
}
