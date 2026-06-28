import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, PublicRoute } from './middleware/ProtectedRoute'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { RegisterSuccess } from './pages/RegisterSuccess'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateReportPage } from './pages/CreateReportPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProfilePage } from './pages/ProfilePage'
import { UnauthorizedPage } from './pages/UnauthorizedPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
          <Routes>
            {/* Landing Page (public) - ONLY for guests */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />

            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/success" element={<RegisterSuccess />} />

            {/* Citizen Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={['citizen']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/create"
              element={
                <ProtectedRoute requiredRoles={['citizen']}>
                  <DashboardLayout>
                    <CreateReportPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRoles={['citizen']}>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Coordinator Routes */}
            <Route
              path="/coordinator/dashboard"
              element={
                <ProtectedRoute requiredRoles={['coordinator']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/assignments"
              element={
                <ProtectedRoute requiredRoles={['coordinator']}>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordinator/technicians"
              element={
                <ProtectedRoute requiredRoles={['coordinator']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Technician Routes */}
            <Route
              path="/technician/dashboard"
              element={
                <ProtectedRoute requiredRoles={['technician']}>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/tasks"
              element={
                <ProtectedRoute requiredRoles={['technician']}>
                  <DashboardLayout>
                    <ReportsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes (for all authenticated users) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
