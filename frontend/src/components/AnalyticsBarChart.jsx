export function AnalyticsBarChart({
  data,
  labelKey,
  valueKey,
  maxValue,
  suffix = '',
  emptyMessage = 'Not enough activity data yet.',
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  const chartMaximum = maxValue ?? Math.max(...data.map((item) => item[valueKey]), 1)

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const width = Math.min(100, Math.max(0, (value / chartMaximum) * 100))

        return (
          <div key={item.id ?? item.courseId ?? item.attemptId ?? index}>
            <div className="mb-1.5 flex items-center justify-between gap-4 text-xs font-bold">
              <span className="truncate text-slate-600">{item[labelKey]}</span>
              <span className="shrink-0 text-violet-700">{value.toLocaleString()}{suffix}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-violet-100" role="img" aria-label={`${item[labelKey]}: ${value}${suffix}`}>
              <div className="h-full rounded-full bg-violet-600" style={{ width: `${width}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
