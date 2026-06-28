import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

const LOADING_TIMEOUT = 10000

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export const ProtectedRoute = ({ children, requiredRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth()
  const [timedOut, setTimedOut] = useState(false)
  const hadProfile = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (profile) hadProfile.current = true

  useEffect(() => {
    if (hadProfile.current) return
    timerRef.current = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (timedOut && !profile) {
    return <Navigate to="/login" replace />
  }

  if (loading || (user && !profile && !timedOut)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Memuat data pengguna...</p>
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
  const [timedOut, setTimedOut] = useState(false)
  const hadProfile = useRef(false)

  if (profile) hadProfile.current = true

  useEffect(() => {
    if (hadProfile.current) return
    const timer = setTimeout(() => setTimedOut(true), LOADING_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  if (timedOut && user && !profile) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (user && !profile && !timedOut) {
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
