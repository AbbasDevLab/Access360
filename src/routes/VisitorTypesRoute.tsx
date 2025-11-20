import React, { useState } from 'react'
import { UserGroupIcon, PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import VisitorTypeForm from '../components/VisitorTypeForm'
import VisitorTypeList from '../components/VisitorTypeList'
import type { VisitorType } from '../services/visitorTypesApi'

export default function VisitorTypesRoute(): JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleVisitorTypeCreated = (visitorType: VisitorType) => {
    console.log('Visitor type created:', visitorType)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
            Visitor Types Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage visitor types for your system
          </p>
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
            Add Type
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
            View Types
          </button>
        </div>
      </div>

      {activeView === 'create' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Create New Visitor Type
            </h2>
            <p className="text-sm text-neutral-600">
              Add a new visitor type to categorize visitors.
            </p>
          </div>
          <VisitorTypeForm
            onSuccess={handleVisitorTypeCreated}
            onError={(error) => console.error('Error creating visitor type:', error)}
          />
        </div>
      )}

      {activeView === 'list' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Visitor Types
            </h2>
            <p className="text-sm text-neutral-600">
              View and manage all visitor types.
            </p>
          </div>
          <VisitorTypeList
            key={refreshKey}
            onRefresh={handleRefreshNeeded}
          />
        </div>
      )}
    </div>
  )
}

