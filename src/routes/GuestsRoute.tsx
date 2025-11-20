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
    <div className="max-w-7xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
        <UserIcon className="w-6 h-6 text-blue-600" />
        Guests Management
      </h1>

      {/* Large Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveView('create')}
          className={`flex-1 px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
            activeView === 'create'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-green-300'
          }`}
        >
          <PlusIcon className="w-5 h-5" />
          Add Guest
        </button>
        <button
          onClick={() => setActiveView('list')}
          className={`flex-1 px-6 py-4 rounded-xl text-base font-semibold transition-all flex items-center justify-center gap-2 ${
            activeView === 'list'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-blue-300'
          }`}
        >
          <ListBulletIcon className="w-5 h-5" />
          View Guests
        </button>
      </div>

      {/* One-page content */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {activeView === 'create' && (
          <GuestForm
            onSuccess={handleGuestCreated}
            onError={(error) => console.error('Error creating guest:', error)}
          />
        )}

        {activeView === 'list' && (
          <GuestList
            key={refreshKey}
            onRefresh={handleRefreshNeeded}
          />
        )}
      </div>
    </div>
  )
}

