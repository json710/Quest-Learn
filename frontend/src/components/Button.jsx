export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-violet-600 text-white shadow-sm hover:bg-violet-700 hover:shadow-md disabled:bg-violet-300',
    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-xs hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:text-slate-400',
    danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-300',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  }

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
