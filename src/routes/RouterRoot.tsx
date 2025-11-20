import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { 
  HomeIcon, 
  UserPlusIcon, 
  QrCodeIcon, 
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
  TagIcon,
  ShieldCheckIcon,
  LanguageIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import i18next, { setupI18n } from '../i18n'

export default function RouterRoot(): JSX.Element {
  // Ensure i18n is initialized
  React.useEffect(() => {
    if (!i18next.isInitialized) {
      setupI18n('en')
    }
  }, [])
  
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState<any>(null)

  useEffect(() => {
    // Check if admin is logged in
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

  // Refresh admin user state when location changes (after login)
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
  
  const menuItems = [
    { path: '/', label: 'Home', icon: HomeIcon, requiresAuth: false },
    { path: '/enroll', label: 'Enroll', icon: UserPlusIcon, requiresAuth: true },
    { path: '/verify', label: 'Verify', icon: QrCodeIcon, requiresAuth: false },
    { path: '/passes', label: 'Reports', icon: ChartBarIcon, requiresAuth: true },
    { path: '/guests', label: 'Guests', icon: UserGroupIcon, requiresAuth: true },
    { path: '/guest-visits', label: 'Visits', icon: ChartBarIcon, requiresAuth: true },
    { path: '/departments', label: 'Departments', icon: BuildingOfficeIcon, requiresAuth: true },
    { path: '/locations', label: 'Locations', icon: MapPinIcon, requiresAuth: true },
    { path: '/visitor-types', label: 'Visitor Types', icon: TagIcon, requiresAuth: true },
    { path: '/admin', label: 'Admin', icon: ShieldCheckIcon, requiresAuth: true },
  ]

  // Filter menu items based on authentication
  const visibleMenuItems = menuItems.filter(item => !item.requiresAuth || adminUser)

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Vertical Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-neutral-900">{t('appName')}</div>
              <div className="text-xs text-neutral-500">Visitor Management</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        {adminUser && (
          <div className="p-4 border-t border-neutral-200">
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-neutral-500 mb-1">Logged in as</div>
              <div className="text-sm font-semibold text-neutral-900">{adminUser.userFullName || adminUser.username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}

        {!adminUser && (
          <div className="p-4 border-t border-neutral-200">
            <NavLink
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ShieldCheckIcon className="w-4 h-4" />
              Admin Login
            </NavLink>
          </div>
        )}

        {/* Language Selector */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center gap-2 mb-2 text-sm text-neutral-600">
            <LanguageIcon className="w-4 h-4" />
            <span>Language</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => i18next.changeLanguage('en')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                i18next.language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => i18next.changeLanguage('ur')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                i18next.language === 'ur'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              اردو
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


