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
import GuardLoginRoute from './routes/GuardLoginRoute'
import GuardDashboardRoute from './routes/GuardDashboardRoute'
import { setupI18n } from './i18n'
import { ErrorBoundary } from './components/ErrorBoundary'

// Ensure i18n is initialized before any components render
setupI18n('en')

const router = createBrowserRouter([
  {
    path: '/',
    element: <RouterRoot />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: 'enroll', element: <EnrollRoute /> },
      { path: 'verify', element: (<React.Suspense fallback={null}><VerifyRoute /></React.Suspense>) },
      { path: 'passes', element: <PassesRoute /> },
      { path: 'departments', element: <DepartmentsRoute /> },
      { path: 'guests', element: <GuestsRoute /> },
      { path: 'guest-visits', element: <GuestVisitsRoute /> },
      { path: 'locations', element: <LocationsRoute /> },
      { path: 'visitor-types', element: <VisitorTypesRoute /> },
      { path: 'admin', element: <AdminRoute /> },
      { path: '*', element: <HomeRoute /> },
    ],
  },
  // Guard routes (standalone, not wrapped in RouterRoot)
  { path: 'guard/login', element: <GuardLoginRoute /> },
  { path: 'guard/dashboard', element: <GuardDashboardRoute /> },
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


