import { Link, Outlet } from 'react-router-dom'

import { BrandMark, Icon } from '../components/Icon.jsx'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-[#f7f7fb] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full border-[48px] border-white/5" />
        <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[52px] border-white/5" />
        <Link to="/" className="relative flex items-center gap-3 text-2xl font-black tracking-tight">
          <BrandMark className="h-11 w-11 bg-white text-violet-700" />
          QuestLearn
        </Link>
        <div className="relative max-w-xl">
          <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Icon name="trophy" className="h-7 w-7" /></div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-violet-200">
            Learn with momentum
          </p>
          <h1 className="mt-4 text-5xl font-black leading-[1.08] tracking-[-0.04em] xl:text-6xl">
            Turn every lesson into meaningful progress.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-violet-100">
            Learn, submit your work, and grow with clear instructor feedback in one focused workspace.
          </p>
        </div>
        <p className="relative text-sm font-medium text-violet-200">QuestLearn learning platform</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3 text-xl font-black text-slate-950 lg:hidden">
            <BrandMark /> <span>Quest<span className="text-violet-600">Learn</span></span>
          </Link>
          <Outlet />
        </div>
      </section>
    </main>
  )
}
