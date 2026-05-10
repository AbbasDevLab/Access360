import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldCheckIcon, PlusIcon, ListBulletIcon, UserIcon, BuildingOfficeIcon, LockClosedIcon, CalendarIcon } from '@heroicons/react/24/outline'
import AdminUserForm from '../components/AdminUserForm'
import AdminUserList from '../components/AdminUserList'
import CompanyForm from '../components/CompanyForm'
import CompanyList from '../components/CompanyList'
import GuardForm from '../components/GuardForm'
import GuardList from '../components/GuardList'
import ScheduledGuestsApproval from '../components/ScheduledGuestsApproval'
import type { AdminUser, Company } from '../services/adminApi'
import type { Guard } from '../services/guardsApi'

export default function AdminRoute() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'guards' | 'scheduled'>('users')
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab === 'scheduled' || tab === 'users' || tab === 'companies' || tab === 'guards') {
      setActiveTab(tab)
      if (tab === 'scheduled') {
        // No create/list toggle on scheduled approval.
        return
      }
      const view = params.get('view')
      if (view === 'list' || view === 'create') setActiveView(view)
    }
  }, [location.search])

  const handleUserCreated = (user: AdminUser) => {
    console.log('Admin user created:', user)
    if (activeView === 'list') {
      setRefreshKey(prev => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey(prev => prev + 1)
      }, 2000)
    }
  }

  const handleCompanyCreated = (company: Company) => {
    console.log('Company created:', company)
    if (activeView === 'list') {
      setRefreshKey(prev => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey(prev => prev + 1)
      }, 2000)
    }
  }

  const handleGuardCreated = (guard: Guard) => {
    console.log('Guard created:', guard)
    if (activeView === 'list') {
      setRefreshKey(prev => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey(prev => prev + 1)
      }, 2000)
    }
  }

  const handleRefreshNeeded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
        <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold text-neutral-100 sm:text-2xl">
          <ShieldCheckIcon className="h-6 w-6 shrink-0 text-blue-400" aria-hidden />
          <span className="min-w-0 break-words">Admin Management</span>
        </h1>
      </div>

      {/* Tab buttons — responsive grid */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-sm font-semibold leading-snug transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-base ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-blue-400'
          }`}
        >
          <UserIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
          <span className="break-words">Users</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('companies')}
          className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-sm font-semibold leading-snug transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-base ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-blue-400'
          }`}
        >
          <BuildingOfficeIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
          <span className="break-words">Companies</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('guards')}
          className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-sm font-semibold leading-snug transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-base ${
            activeTab === 'guards'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-blue-400'
          }`}
        >
          <LockClosedIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
          <span className="break-words">Guards</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={`flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-center text-sm font-semibold leading-snug transition-all sm:flex-row sm:gap-2 sm:px-4 sm:py-3 sm:text-base ${
            activeTab === 'scheduled'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-blue-400'
          }`}
        >
          <CalendarIcon className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden />
          <span className="max-w-full break-words">Scheduled Guests</span>
        </button>
      </div>

      {/* Action Buttons - Hide for scheduled guests */}
      {activeTab !== 'scheduled' && (
        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveView('create')}
            className={`flex min-h-[2.75rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:px-5 sm:py-3 sm:text-base ${
              activeView === 'create'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-green-400'
            }`}
          >
            <PlusIcon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate sm:whitespace-normal sm:break-words sm:text-center">
              Add {activeTab === 'users' ? 'User' : activeTab === 'companies' ? 'Company' : 'Guard'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`flex min-h-[2.75rem] min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all sm:px-5 sm:py-3 sm:text-base ${
              activeView === 'list'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-neutral-800 text-neutral-200 ring-2 ring-inset ring-neutral-700 hover:ring-blue-400'
            }`}
          >
            <ListBulletIcon className="h-5 w-5 shrink-0" aria-hidden />
            <span className="truncate sm:whitespace-normal sm:break-words sm:text-center">
              View {activeTab === 'users' ? 'Users' : activeTab === 'companies' ? 'Companies' : 'Guards'}
            </span>
          </button>
        </div>
      )}

      {/* Content Area - One Page */}
      <div className="min-w-0 overflow-x-auto rounded-xl border border-neutral-700 bg-neutral-800 p-4 sm:p-6">
        {activeTab === 'users' && (
          <>
            {activeView === 'create' && (
              <AdminUserForm
                onSuccess={handleUserCreated}
                onError={(error) => console.error('Error creating admin user:', error)}
              />
            )}

            {activeView === 'list' && (
              <AdminUserList
                key={refreshKey}
                onRefresh={handleRefreshNeeded}
              />
            )}
          </>
        )}

        {activeTab === 'companies' && (
          <>
            {activeView === 'create' && (
              <CompanyForm
                onSuccess={handleCompanyCreated}
                onError={(error) => console.error('Error creating company:', error)}
              />
            )}

            {activeView === 'list' && (
              <CompanyList
                key={refreshKey}
                onRefresh={handleRefreshNeeded}
              />
            )}
          </>
        )}

        {activeTab === 'guards' && (
          <>
            {activeView === 'create' && (
              <GuardForm
                onSuccess={handleGuardCreated}
                onError={(error) => console.error('Error creating guard:', error)}
              />
            )}

            {activeView === 'list' && (
              <GuardList
                key={refreshKey}
                onRefresh={handleRefreshNeeded}
              />
            )}
          </>
        )}

        {activeTab === 'scheduled' && (
          <ScheduledGuestsApproval />
        )}
      </div>
    </div>
  )
}

