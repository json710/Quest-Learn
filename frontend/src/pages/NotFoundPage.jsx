import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you requested does not exist.</p>
        <Link className="mt-6 inline-block font-semibold text-indigo-700" to="/">
          Go to dashboard
        </Link>
      </div>
    </main>
  )
}
