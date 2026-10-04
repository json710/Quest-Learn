import { Icon } from './Icon.jsx'

export function EmptyState({ title, message, action, icon = 'sparkles' }) {
  return (
    <div className="surface-card border-dashed px-6 py-10 text-center sm:py-12">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
