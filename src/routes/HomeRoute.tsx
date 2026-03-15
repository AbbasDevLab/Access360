import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheckIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

export default function HomeRoute(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 px-4">
      <div className="w-full max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-xs font-medium text-blue-300 border border-blue-500/30">
            <ShieldCheckIcon className="w-4 h-4" />
            Access360 Visitor Management
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-50">
            Choose how you want to login
          </h1>
          <p className="text-neutral-400 text-sm md:text-base">
            One home page for all roles – no need to type routes manually.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate('/login')}
            className="group relative flex flex-col items-start gap-3 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-500/20 to-blue-900/40 px-6 py-6 text-left shadow-lg hover:shadow-blue-900/40 hover:border-blue-400 transition-all"
          >
            <div className="rounded-2xl bg-blue-500/30 p-3 inline-flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7 text-blue-100" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-50">
                Login as Admin
              </h2>
              <p className="text-xs text-blue-100/80">
                Manage departments, guests, locations, guards, and reports.
              </p>
            </div>
            <span className="mt-2 text-xs font-medium text-blue-100/90 group-hover:text-white">
              Go to Admin Portal →
            </span>
          </button>

          <button
            onClick={() => {
              window.location.href = 'https://faculty.access360.site/login'
            }}
            className="group relative flex flex-col items-start gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-900/30 px-6 py-6 text-left shadow-lg hover:shadow-emerald-900/40 hover:border-emerald-400 transition-all"
          >
            <div className="rounded-2xl bg-emerald-500/30 p-3 inline-flex items-center justify-center">
              <UserIcon className="w-7 h-7 text-emerald-100" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-50">
                Login as Faculty
              </h2>
              <p className="text-xs text-emerald-100/80">
                Schedule guests and manage your visit requests.
              </p>
            </div>
            <span className="mt-2 text-xs font-medium text-emerald-100/90 group-hover:text-white">
              Go to Faculty Portal →
            </span>
          </button>

          <button
            onClick={() => navigate('/guard/login')}
            className="group relative flex flex-col items-start gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-900/30 px-6 py-6 text-left shadow-lg hover:shadow-amber-900/40 hover:border-amber-400 transition-all"
          >
            <div className="rounded-2xl bg-amber-500/30 p-3 inline-flex items-center justify-center">
              <UserGroupIcon className="w-7 h-7 text-amber-100" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-50">
                Login as Guard
              </h2>
              <p className="text-xs text-amber-100/80">
                Access the guard dashboard for check-ins and verification.
              </p>
            </div>
            <span className="mt-2 text-xs font-medium text-amber-100/90 group-hover:text-white">
              Go to Guard Portal →
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
