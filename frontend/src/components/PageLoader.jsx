export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="grid min-h-64 place-items-center text-sm font-semibold text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-violet-100 border-t-violet-600" />
        <span>{label}</span>
      </div>
    </div>
  )
}
