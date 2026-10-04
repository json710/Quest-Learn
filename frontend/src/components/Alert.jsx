export function Alert({ type = 'error', children }) {
  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 before:bg-emerald-500'
      : 'border-rose-200 bg-rose-50 text-rose-800 before:bg-rose-500'

  if (!children) return null

  return (
    <div className={`relative rounded-xl border py-3 pr-4 pl-7 text-sm font-medium before:absolute before:top-1/2 before:left-3 before:h-2 before:w-2 before:-translate-y-1/2 before:rounded-full ${styles}`} role="alert">
      {children}
    </div>
  )
}
