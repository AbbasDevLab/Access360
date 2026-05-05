import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import GuestVisitForm from '../components/GuestVisitForm'
import GuestVisitList from '../components/GuestVisitList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { GuestVisit } from '../services/guestVisitApi'

export default function GuestVisitsRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleVisitCreated = (visit: GuestVisit) => {
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
      title="Visits"
      description="Create check-ins and review visit history from the database (open and completed visits)."
      actions={
        <ViewToggle
          aria-label="Visits view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'New visit', icon: PlusIcon },
            { id: 'list', label: 'All visits', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'Check-in' : 'Visit log'}
        subtitle={
          activeView === 'create'
            ? 'Record a guest visit with department, type, and card details.'
            : 'Live list from the server — refresh or delete from here.'
        }
      >
        {activeView === 'create' && (
          <GuestVisitForm
            onSuccess={handleVisitCreated}
            onError={(error) => console.error('Error creating guest visit:', error)}
          />
        )}
        {activeView === 'list' && <GuestVisitList key={refreshKey} onRefresh={handleRefreshNeeded} />}
      </ContentCard>
    </PageLayout>
  )
}
