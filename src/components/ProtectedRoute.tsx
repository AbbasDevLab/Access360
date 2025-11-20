import React, { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresAuth?: boolean
}

export default function ProtectedRoute({ children, requiresAuth = true }: ProtectedRouteProps): JSX.Element {
  const location = useLocation()
  
  // Check authentication synchronously - no loading state needed
  const isAuthenticated = useMemo(() => {
    if (!requiresAuth) {
      return true
    }
    
    const stored = localStorage.getItem('adminUser')
    if (!stored) {
      return false
    }
    
    try {
      const user = JSON.parse(stored)
      return user.loggedIn === true
    } catch (e) {
      return false
    }
  }, [requiresAuth, location.pathname]) // Re-check when pathname changes

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

