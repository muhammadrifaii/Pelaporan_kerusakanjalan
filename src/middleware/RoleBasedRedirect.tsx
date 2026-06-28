import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardUrl } from './ProtectedRoute'

export const RoleBasedRedirect = () => {
  const { user, profile, loading } = useAuth()

  if (loading || (user && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile) {
    return <Navigate to={getDashboardUrl(profile.role)} replace />
  }

  return <Navigate to="/dashboard" replace />
}
