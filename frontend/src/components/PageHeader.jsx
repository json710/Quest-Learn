export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2.5 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}
