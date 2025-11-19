import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LanguageIcon } from '@heroicons/react/24/outline'
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
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-900">
      <header className="border-b sticky top-0 z-30 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <div className="font-bold text-xl tracking-tight text-neutral-900">{t('appName')}</div>
              <div className="text-xs text-neutral-500">Visitor Management System</div>
            </div>
          </div>
          <nav className="flex gap-1 bg-neutral-100 p-1 rounded-xl flex-wrap">
            <NavLink to="/" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>{t('home')}</NavLink>
            <NavLink to="/enroll" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>{t('enroll')}</NavLink>
            <NavLink to="/verify" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>{t('verify')}</NavLink>
            <NavLink to="/passes" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Reports</NavLink>
            <NavLink to="/departments" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Departments</NavLink>
            <NavLink to="/guests" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Guests</NavLink>
            <NavLink to="/guest-visits" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Visits</NavLink>
            <NavLink to="/locations" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Locations</NavLink>
            <NavLink to="/visitor-types" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Visitor Types</NavLink>
            <NavLink to="/admin" className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:text-neutral-800'}`}>Admin</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
              <LanguageIcon className="w-4 h-4" />
              <span>Language</span>
            </div>
            <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
              <button onClick={() => i18next.changeLanguage('en')} className="px-3 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors">EN</button>
              <div className="h-6 w-px bg-neutral-200" />
              <button onClick={() => i18next.changeLanguage('ur')} className="px-3 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors">اردو</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t bg-white/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              © {new Date().getFullYear()} Access360 - Forman Christian College University
            </div>
            <div className="text-sm text-neutral-400">
              AI-Powered Visitor Management System
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


