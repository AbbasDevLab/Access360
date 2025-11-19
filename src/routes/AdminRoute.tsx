import React, { useState } from 'react'
import { ShieldCheckIcon, PlusIcon, ListBulletIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import AdminUserForm from '../components/AdminUserForm'
import AdminUserList from '../components/AdminUserList'
import CompanyForm from '../components/CompanyForm'
import CompanyList from '../components/CompanyList'
import type { AdminUser, Company } from '../services/adminApi'

export default function AdminRoute(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'users' | 'companies'>('users')
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

  const handleRefreshNeeded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
            Admin Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage admin users and companies
          </p>
        </div>
        <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'companies'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            <BuildingOfficeIcon className="w-4 h-4" />
            Companies
          </button>
        </div>
      </div>

      <div className="flex gap-2 bg-neutral-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveView('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeView === 'create'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          <PlusIcon className="w-4 h-4" />
          Add {activeTab === 'users' ? 'User' : 'Company'}
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeView === 'list'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-800'
          }`}
        >
          <ListBulletIcon className="w-4 h-4" />
          View {activeTab === 'users' ? 'Users' : 'Companies'}
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          {activeView === 'create' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Create New Admin User
                </h2>
                <p className="text-sm text-neutral-600">
                  Add a new admin user to your system.
                </p>
              </div>
              <AdminUserForm
                onSuccess={handleUserCreated}
                onError={(error) => console.error('Error creating admin user:', error)}
              />
            </div>
          )}

          {activeView === 'list' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Admin Users
                </h2>
                <p className="text-sm text-neutral-600">
                  View and manage all admin users.
                </p>
              </div>
              <AdminUserList
                key={refreshKey}
                onRefresh={handleRefreshNeeded}
              />
            </div>
          )}
        </>
      )}

      {activeTab === 'companies' && (
        <>
          {activeView === 'create' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Create New Company
                </h2>
                <p className="text-sm text-neutral-600">
                  Add a new company to your system.
                </p>
              </div>
              <CompanyForm
                onSuccess={handleCompanyCreated}
                onError={(error) => console.error('Error creating company:', error)}
              />
            </div>
          )}

          {activeView === 'list' && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Companies
                </h2>
                <p className="text-sm text-neutral-600">
                  View and manage all companies.
                </p>
              </div>
              <CompanyList
                key={refreshKey}
                onRefresh={handleRefreshNeeded}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

