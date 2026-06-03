import React, { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresAuth?: boolean
  /** If provided, the logged-in user's role must match (case-insensitive).
   *  A mismatched role is bounced — Guards go to their own portal, anyone
   *  else gets sent back to login. */
  requiredRole?: string
}

interface StoredAdminUser {
  loggedIn?: boolean
  role?: string
}

export default function ProtectedRoute({
  children,
  requiresAuth = true,
  requiredRole,
}: ProtectedRouteProps): React.JSX.Element {
  const location = useLocation()

  const { isAuthenticated, role } = useMemo(() => {
    if (!requiresAuth) {
      return { isAuthenticated: true, role: undefined as string | undefined }
    }
    const stored = localStorage.getItem('adminUser')
    if (!stored) return { isAuthenticated: false, role: undefined }
    try {
      const user = JSON.parse(stored) as StoredAdminUser
      return {
        isAuthenticated: user.loggedIn === true,
        role: typeof user.role === 'string' ? user.role : undefined,
      }
    } catch {
      return { isAuthenticated: false, role: undefined }
    }
  }, [requiresAuth, location.pathname])

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (
    requiredRole &&
    (role ?? '').trim().toLowerCase() !== requiredRole.trim().toLowerCase()
  ) {
    // Logged in but wrong role for this page. If they're a Guard, send them
    // to the guard portal where they belong; otherwise back to login.
    const target =
      (role ?? '').trim().toLowerCase() === 'guard'
        ? '/guard/dashboard'
        : '/login'
    return <Navigate to={target} replace />
  }

  return <>{children}</>
}


