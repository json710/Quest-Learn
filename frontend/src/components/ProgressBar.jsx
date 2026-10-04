export function ProgressBar({ value, label, detail, className = '', tone = 'default' }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0))
  const inverse = tone === 'inverse'

  return (
    <div className={className}>
      {(label || detail) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
          <span className={inverse ? 'text-white' : 'text-slate-600'}>{label}</span>
          <span className={inverse ? 'text-violet-200' : 'text-slate-500'}>{detail}</span>
        </div>
      )}
      <div className={`h-2 overflow-hidden rounded-full ${inverse ? 'bg-white/15' : 'bg-violet-100'}`} role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={safeValue}>
        <div className={`h-full rounded-full transition-[width] ${inverse ? 'bg-white' : 'bg-violet-600'}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}
