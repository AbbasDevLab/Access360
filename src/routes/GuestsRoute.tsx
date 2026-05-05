import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import GuestForm from '../components/GuestForm'
import GuestList from '../components/GuestList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { Guest } from '../services/guestsApi'

export default function GuestsRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGuestCreated = (guest: Guest) => {
    if (activeView === 'list') {
      setRefreshKey((prev) => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey((prev) => prev + 1)
      }, 2000)
    }
  }

  const handleRefreshNeeded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <PageLayout
      title="Guests"
      description="Register visitors and manage guest records. Data is loaded from your Access360 API."
      actions={
        <ViewToggle
          aria-label="Guests view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'Add guest', icon: PlusIcon },
            { id: 'list', label: 'Directory', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'New guest' : 'Guest directory'}
        subtitle={
          activeView === 'create'
            ? 'Complete the form to create a guest profile.'
            : 'Search, review, and maintain guest records from the database.'
        }
      >
        {activeView === 'create' && (
          <GuestForm
            onSuccess={handleGuestCreated}
            onError={(error) => console.error('Error creating guest:', error)}
          />
        )}
        {activeView === 'list' && <GuestList key={refreshKey} onRefresh={handleRefreshNeeded} />}
      </ContentCard>
    </PageLayout>
  )
}
