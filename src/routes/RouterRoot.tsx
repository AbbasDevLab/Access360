import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  PresentationChartLineIcon,
  BuildingOfficeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MapPinIcon,
  TagIcon,
  ShieldCheckIcon,
  LanguageIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import i18next, { setupI18n } from '../i18n'

type NavGroup = 'overview' | 'counter' | 'directory' | 'system'

type MenuItem = {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth: boolean
  group: NavGroup
}

const GROUP_LABELS: Record<NavGroup, string> = {
  overview: 'Overview',
  counter: 'Check-in & check-out',
  directory: 'Organization',
  system: 'Administration',
}

const GROUP_ORDER: NavGroup[] = ['overview', 'counter', 'directory', 'system']

export default function RouterRoot(): React.JSX.Element {
  React.useEffect(() => {
    if (!i18next.isInitialized) {
      setupI18n('en')
    }
  }, [])

  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user.loggedIn) {
          setAdminUser(user)
        }
      } catch (e) {
        localStorage.removeItem('adminUser')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user.loggedIn) {
          setAdminUser(user)
        } else {
          setAdminUser(null)
        }
      } catch (e) {
        setAdminUser(null)
      }
    } else {
      setAdminUser(null)
    }
  }, [location])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  const isMinimalHome = location.pathname === '/'

  const menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, requiresAuth: true, group: 'overview' },
    { path: '/passes', label: 'Reports', icon: PresentationChartLineIcon, requiresAuth: true, group: 'overview' },
    { path: '/counter/check-in', label: 'Check in', icon: ArrowRightIcon, requiresAuth: true, group: 'counter' },
    { path: '/counter/check-out', label: 'Check out', icon: ArrowLeftIcon, requiresAuth: true, group: 'counter' },
    { path: '/departments', label: 'Departments', icon: BuildingOfficeIcon, requiresAuth: true, group: 'directory' },
    { path: '/locations', label: 'Locations', icon: MapPinIcon, requiresAuth: true, group: 'directory' },
    { path: '/visitor-types', label: 'Visitor types', icon: TagIcon, requiresAuth: true, group: 'directory' },
    { path: '/admin', label: 'Admin', icon: ShieldCheckIcon, requiresAuth: true, group: 'system' },
  ]

  const visibleMenuItems = menuItems.filter((item) => !item.requiresAuth || adminUser)

  if (isMinimalHome) {
    return (
      <main className="min-h-screen bg-neutral-900">
        <div className="p-0">
          <Outlet />
        </div>
      </main>
    )
  }

  return (
    <div className="portal-theme flex min-h-screen bg-[#e8eaed]">
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,100vw)] flex-col border-r border-neutral-200 bg-white shadow-lg transition-transform duration-200 ease-out lg:static lg:z-0 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between gap-2 border-b border-neutral-200 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A651] shadow-md shadow-[#00A651]/30">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-bold tracking-tight text-neutral-900">{t('appName')}</div>
              <div className="text-xs text-neutral-500">Visitor management</div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          {GROUP_ORDER.map((groupId) => {
            const items = visibleMenuItems.filter((i) => i.group === groupId)
            if (items.length === 0) return null
            return (
              <div key={groupId} className="mb-4 last:mb-0">
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                  {GROUP_LABELS[groupId]}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#00A651]/10 text-[#007a3d] ring-1 ring-[#00A651]/35 font-semibold'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {adminUser ? (
          <div className="border-t border-neutral-200 p-4">
            <div className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Signed in</div>
              <div className="truncate text-sm font-semibold text-neutral-900">
                {adminUser.userFullName || adminUser.username}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Log out
            </button>
          </div>
        ) : (
          <div className="border-t border-neutral-200 p-4">
            <NavLink
              to="/login"
              onClick={() => setMobileNavOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00A651]/30 transition-colors hover:bg-[#009148]"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Admin sign in
            </NavLink>
          </div>
        )}

        <div className="border-t border-neutral-200 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-neutral-500">
            <LanguageIcon className="h-4 w-4" aria-hidden />
            Language
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => i18next.changeLanguage('en')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                i18next.language === 'en'
                  ? 'bg-[#00A651] text-white'
                  : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => i18next.changeLanguage('ur')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                i18next.language === 'ur'
                  ? 'bg-[#00A651] text-white'
                  : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50'
              }`}
            >
              اردو
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#e8eaed]">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <span className="truncate text-sm font-bold text-neutral-900">{t('appName')}</span>
        </div>
        <div className="mx-auto w-full max-w-[1600px] flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}





