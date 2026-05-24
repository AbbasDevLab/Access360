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
    accent: 'green',
  },
  {
    path: '/counter/check-out',
    label: 'Check out',
    description: 'Search active visits and process visitor exit',
    icon: ArrowLeftIcon,
    accent: 'red',
  },
  {
    path: '/admin?tab=scheduled',
    label: 'Faculty requests',
    description: 'Approve or reject faculty guest requests',
    icon: ClipboardDocumentListIcon,
    accent: 'blue',
  },
  { path: '/departments', label: 'Departments', description: 'Departments & categories', icon: BuildingOfficeIcon, accent: 'blue' },
  { path: '/locations', label: 'Locations', description: 'Manage locations', icon: MapPinIcon, accent: 'blue' },
  { path: '/visitor-types', label: 'Visitor types', description: 'Visitor type config', icon: TagIcon, accent: 'blue' },
  { path: '/admin', label: 'Admin management', description: 'Users, companies, guards, scheduled guests', icon: ShieldCheckIcon, accent: 'blue' },
  { path: '/passes', label: 'Reports', description: 'Analytics and exports', icon: PresentationChartLineIcon, accent: 'neutral' },
]

const accentIcon: Record<string, string> = {
  green: 'text-[#00A651]',
  red: 'text-[#ED1C24]',
  blue: 'text-[#2563eb]',
  neutral: 'text-neutral-600',
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
      description={`Welcome back, ${displayName}. Use the links below to open each area — all lists load from your Access360 API.`}
    >
      <ContentCard title="Quick links" subtitle="Jump to the most common admin tasks.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon
            const iconColor = accentIcon[item.accent] || accentIcon.neutral
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="group flex items-center gap-4 rounded-[20px] border border-neutral-200 bg-white px-5 py-4 text-left shadow-sm ring-1 ring-black/5 transition-all hover:border-[#00A651]/40 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-50 ${iconColor}`}>
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold text-neutral-900">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-neutral-600">{item.description}</span>
                </div>
                <ArrowRightIcon
                  className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#00A651]"
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


