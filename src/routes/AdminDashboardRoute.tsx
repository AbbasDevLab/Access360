import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  TagIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'

const quickLinks = [
  {
    path: '/counter/check-in',
    label: 'Check in',
    description: 'Same as guard desk — scan ID and register a visitor',
    icon: ArrowRightIcon,
    color: 'green',
  },
  {
    path: '/counter/check-out',
    label: 'Check out',
    description: 'Search active visits and process visitor exit',
    icon: ArrowLeftIcon,
    color: 'red',
  },
  { path: '/admin?tab=scheduled', label: 'Faculty requests', description: 'Approve or reject faculty guest requests', icon: ClipboardDocumentListIcon, color: 'emerald' },
  { path: '/departments', label: 'Departments', description: 'Departments & categories', icon: BuildingOfficeIcon, color: 'sky' },
  { path: '/locations', label: 'Locations', description: 'Manage locations', icon: MapPinIcon, color: 'rose' },
  { path: '/visitor-types', label: 'Visitor types', description: 'Visitor type config', icon: TagIcon, color: 'teal' },
  { path: '/admin', label: 'Admin management', description: 'Users, companies, guards, scheduled guests', icon: ShieldCheckIcon, color: 'blue' },
  { path: '/passes', label: 'Reports', description: 'Analytics and exports', icon: PresentationChartLineIcon, color: 'neutral' },
]

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:border-blue-400',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400',
  green: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/35 hover:border-emerald-400',
  red: 'bg-red-500/20 text-red-300 border-red-500/35 hover:border-red-400',
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30 hover:border-violet-400',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-400',
  sky: 'bg-sky-500/20 text-sky-400 border-sky-500/30 hover:border-sky-400',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:border-rose-400',
  teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30 hover:border-teal-400',
  neutral: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30 hover:border-neutral-400',
}

export default function AdminDashboardRoute(): React.JSX.Element {
  const navigate = useNavigate()
  const adminUser = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('adminUser')
      if (!stored) return null
      const user = JSON.parse(stored)
      return user?.loggedIn ? user : null
    } catch {
      return null
    }
  }, [])

  const displayName = adminUser?.userFullName || adminUser?.username || 'Admin'

  return (
    <PageLayout
      title="Dashboard"
      description={
        `Welcome back, ${displayName}. Use the links below to open each area — all lists load from your Access360 API.`
      }
    >
      <ContentCard title="Quick links" subtitle="Jump to the most common admin tasks.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon
            const color = colorClasses[item.color] || colorClasses.neutral
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`group flex items-center gap-4 rounded-xl border bg-neutral-900/40 px-5 py-4 text-left transition-all hover:bg-neutral-900/70 ${color}`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-current/10">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-neutral-100">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-400">{item.description}</span>
                </div>
                <ArrowRightIcon
                  className="h-5 w-5 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-current"
                  aria-hidden
                />
              </button>
            )
          })}
        </div>
      </ContentCard>
    </PageLayout>
  )
}
