import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheckIcon,
  UserIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'

export default function HomeRoute(): React.JSX.Element {
  const navigate = useNavigate()

  // When admin is already logged in, send them to dashboard (don't show public landing)
  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.loggedIn) {
          navigate('/dashboard', { replace: true })
          return
        }
      } catch {
        // ignore
      }
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero / Brand section - clearly "home" not login */}
      <header className="relative overflow-hidden border-b border-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-emerald-600/10" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-6">
            <BuildingOffice2Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Access360
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Visitor Management — secure check-in, scheduling, and reporting for your organization.
          </p>
        </div>
      </header>

      {/* Portals section - "Where do you want to go?" */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-xl font-semibold text-neutral-300 mb-1">
            Sign in to your portal
          </h2>
          <p className="text-sm text-neutral-500">
            Choose your role to continue
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Link
            to="/login"
            className="group flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:border-blue-500/50 px-5 py-5 text-left transition-all no-underline"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30">
              <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-white">Admin</span>
              <span className="block text-xs text-neutral-400 mt-0.5">Users, departments, reports</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-neutral-500 group-hover:text-blue-400 flex-shrink-0" />
          </Link>

          <a
            href="https://faculty.access360.site/login"
            className="group flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:border-emerald-500/50 px-5 py-5 text-left transition-all no-underline"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30">
              <UserIcon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-white">Faculty</span>
              <span className="block text-xs text-neutral-400 mt-0.5">Schedule guests, visit requests</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-neutral-500 group-hover:text-emerald-400 flex-shrink-0" />
          </a>

          <Link
            to="/guard/login"
            className="group flex items-center gap-4 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 hover:border-amber-500/50 px-5 py-5 text-left transition-all no-underline"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30">
              <UserGroupIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-white">Guard</span>
              <span className="block text-xs text-neutral-400 mt-0.5">Check-in, check-out, verify</span>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 flex-shrink-0" />
          </Link>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-10">
          Access360 Visitor Management System
        </p>
      </main>
    </div>
  )
}
