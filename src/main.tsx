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
import { setupI18n } from './i18n'

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
      { path: '*', element: <HomeRoute /> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


