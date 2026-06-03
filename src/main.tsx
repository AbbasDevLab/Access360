import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './style.css'

import RouterRoot from './routes/RouterRoot'
import HomeRoute from './routes/HomeRoute'
import EnrollRoute from './routes/EnrollRoute'
const VerifyRoute = React.lazy(() => import('./routes/VerifyRoute'))
import PassesRoute from './routes/PassesRoute'
import DepartmentsRoute from './routes/DepartmentsRoute'
import GuestsRoute from './routes/GuestsRoute'
import GuestVisitsRoute from './routes/GuestVisitsRoute'
import LocationsRoute from './routes/LocationsRoute'
import VisitorTypesRoute from './routes/VisitorTypesRoute'
import AdminRoute from './routes/AdminRoute'
import AdminDashboardRoute from './routes/AdminDashboardRoute'
import AdminCheckInRoute from './routes/AdminCheckInRoute'
import AdminCheckOutRoute from './routes/AdminCheckOutRoute'
import AdminLoginRoute from './routes/AdminLoginRoute'
import GuardLoginRoute from './routes/GuardLoginRoute'
import GuardDashboardRoute from './routes/GuardDashboardRoute'
import ProtectedRoute from './components/ProtectedRoute'
import { setupI18n } from './i18n'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure i18n is initialized before any components render
setupI18n('en')

const router = createBrowserRouter([
  // Standalone routes first so /login and /guard/* are not matched by the catch-all under /
  { path: 'login', element: <AdminLoginRoute /> },
  { path: 'guard/login', element: <GuardLoginRoute /> },
  // Sub-paths must be registered so each step gets a history entry (browser Back returns to dashboard).
  { path: 'guard/dashboard/check-in', element: <GuardDashboardRoute /> },
  { path: 'guard/dashboard/check-out', element: <GuardDashboardRoute /> },
  { path: 'guard/dashboard', element: <GuardDashboardRoute /> },
  {
    path: '/',
    element: <RouterRoot />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'dashboard', element: <ProtectedRoute requiredRole="Admin"><AdminDashboardRoute /></ProtectedRoute> },
      { path: 'counter/check-in', element: <ProtectedRoute><AdminCheckInRoute /></ProtectedRoute> },
      { path: 'counter/check-out', element: <ProtectedRoute><AdminCheckOutRoute /></ProtectedRoute> },
      { path: 'enroll', element: <ProtectedRoute><EnrollRoute /></ProtectedRoute> },
      { path: 'verify', element: (<React.Suspense fallback={null}><VerifyRoute /></React.Suspense>) },
      { path: 'passes', element: <ProtectedRoute><PassesRoute /></ProtectedRoute> },
      { path: 'departments', element: <ProtectedRoute><DepartmentsRoute /></ProtectedRoute> },
      { path: 'guests', element: <ProtectedRoute><GuestsRoute /></ProtectedRoute> },
      { path: 'guest-visits', element: <ProtectedRoute><GuestVisitsRoute /></ProtectedRoute> },
      { path: 'locations', element: <ProtectedRoute><LocationsRoute /></ProtectedRoute> },
      { path: 'visitor-types', element: <ProtectedRoute><VisitorTypesRoute /></ProtectedRoute> },
      { path: 'admin', element: <ProtectedRoute><AdminRoute /></ProtectedRoute> },
      { path: '*', element: <HomeRoute /> },
    ],
  },
])

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Error Loading Application</h1>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>Please check the browser console for more details.</p>
    </div>
  `
}


