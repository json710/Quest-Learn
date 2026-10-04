export function StatusBadge({ status, children }) {
  const normalized = status?.toUpperCase()
  const styles = {
    PUBLISHED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    DRAFT: 'border-amber-200 bg-amber-50 text-amber-700',
    REVIEWED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    SUBMITTED: 'border-amber-200 bg-amber-50 text-amber-700',
    IN_PROGRESS: 'border-blue-200 bg-blue-50 text-blue-700',
    ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    INACTIVE: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${styles[normalized] ?? 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children ?? normalized}
    </span>
  )
}
