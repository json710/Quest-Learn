import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth.js'
import { homeForRole } from '../utils/routes.js'
import { PageLoader } from './PageLoader.jsx'

export function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader label="Restoring your session..." />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return <Outlet />
}
