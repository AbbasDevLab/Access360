import React, { useState } from 'react'
import { UserIcon, PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import GuestForm from '../components/GuestForm'
import GuestList from '../components/GuestList'
import type { Guest } from '../services/guestsApi'

export default function GuestsRoute(): JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGuestCreated = (guest: Guest) => {
    console.log('Guest created:', guest)
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
            <UserIcon className="w-8 h-8 text-blue-600" />
            Guests Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage guests in your system
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
            Add Guest
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
            View Guests
          </button>
        </div>
      </div>

      {activeView === 'create' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Create New Guest
            </h2>
            <p className="text-sm text-neutral-600">
              Add a new guest to your system.
            </p>
          </div>
          <GuestForm
            onSuccess={handleGuestCreated}
            onError={(error) => console.error('Error creating guest:', error)}
          />
        </div>
      )}

      {activeView === 'list' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Guests
            </h2>
            <p className="text-sm text-neutral-600">
              View and manage all guests.
            </p>
          </div>
          <GuestList
            key={refreshKey}
            onRefresh={handleRefreshNeeded}
          />
        </div>
      )}
    </div>
  )
}

