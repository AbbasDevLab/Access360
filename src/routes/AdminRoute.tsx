import { useState } from 'react'
import { ShieldCheckIcon, PlusIcon, ListBulletIcon, UserIcon, BuildingOfficeIcon, LockClosedIcon, CalendarIcon } from '@heroicons/react/24/outline'
import AdminUserForm from '../components/AdminUserForm'
import AdminUserList from '../components/AdminUserList'
import CompanyForm from '../components/CompanyForm'
import CompanyList from '../components/CompanyList'
import GuardForm from '../components/GuardForm'
import GuardList from '../components/GuardList'
import ScheduledGuestsApproval from '../components/ScheduledGuestsApproval'
import FacultyForm from '../components/FacultyForm'
import FacultyList from '../components/FacultyList'
import type { AdminUser, Company } from '../services/adminApi'
import type { Guard } from '../services/guardsApi'

export default function AdminRoute() {
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'guards' | 'scheduled' | 'faculty'>('users')
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-blue-400" />
          Admin Management
        </h1>
      </div>

      {/* Large Tab Buttons */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
          }`}
        >
          <UserIcon className="w-6 h-6" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${
            activeTab === 'companies'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
          }`}
        >
          <BuildingOfficeIcon className="w-6 h-6" />
          Companies
        </button>
        <button
          onClick={() => setActiveTab('guards')}
          className={`px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${
            activeTab === 'guards'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
          }`}
        >
          <LockClosedIcon className="w-6 h-6" />
          Guards
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${
            activeTab === 'scheduled'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
          }`}
        >
          <CalendarIcon className="w-6 h-6" />
          Scheduled Guests
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-3 ${
            activeTab === 'faculty'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
          }`}
        >
          <UserIcon className="w-6 h-6" />
          Faculty
        </button>
      </div>

      {/* Action Buttons - Hide for scheduled guests */}
      {activeTab !== 'scheduled' && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setActiveView('create')}
            className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
              activeView === 'create'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-green-400'
            }`}
          >
            <PlusIcon className="w-5 h-5" />
            Add {activeTab === 'users' ? 'User' : activeTab === 'companies' ? 'Company' : activeTab === 'faculty' ? 'Faculty' : 'Guard'}
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`flex-1 px-6 py-3 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
              activeView === 'list'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-neutral-800 text-neutral-200 border-2 border-neutral-700 hover:border-blue-400'
            }`}
          >
            <ListBulletIcon className="w-5 h-5" />
            View {activeTab === 'users' ? 'Users' : activeTab === 'companies' ? 'Companies' : activeTab === 'faculty' ? 'Faculty' : 'Guards'}
          </button>
        </div>
      )}

      {/* Content Area - One Page */}
      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
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

        {activeTab === 'faculty' && (
          <>
            {activeView === 'create' && (
              <FacultyForm
                onSuccess={() => handleRefreshNeeded()}
                onError={(error) => console.error('Error creating faculty:', error)}
              />
            )}

            {activeView === 'list' && (
              <FacultyList
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

