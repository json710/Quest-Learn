import { Link } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth.js'
import { homeForRole } from '../utils/routes.js'

export function UnauthorizedPage() {
  const { user } = useAuth()

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">Access denied</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">This area is not available.</h1>
        <p className="mt-3 text-slate-600">Your account role does not have a Sprint 1 workspace.</p>
        <Link className="mt-6 inline-block font-semibold text-indigo-700" to={user ? homeForRole(user.role) : '/login'}>
          Return to QuestLearn
        </Link>
      </div>
    </main>
  )
}
