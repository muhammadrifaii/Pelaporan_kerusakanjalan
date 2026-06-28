import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
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

  if (requiredRoles && profile && !requiredRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  // Profile still being fetched — wait before showing anything
  if (user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (user && profile) {
    const dashboardRoutes: Record<UserRole, string> = {
      citizen: '/dashboard',
      admin: '/admin/dashboard',
      coordinator: '/coordinator/dashboard',
      technician: '/technician/dashboard',
    }
    return <Navigate to={dashboardRoutes[profile.role]} replace />
  }

  return <>{children}</>
}

// Helper function to get the correct dashboard URL for a role
export const getDashboardUrl = (role: UserRole): string => {
  const dashboardRoutes: Record<UserRole, string> = {
    citizen: '/dashboard',
    admin: '/admin/dashboard',
    coordinator: '/coordinator/dashboard',
    technician: '/technician/dashboard',
  }
  return dashboardRoutes[role]
}
