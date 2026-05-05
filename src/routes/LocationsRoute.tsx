import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import LocationForm from '../components/LocationForm'
import LocationList from '../components/LocationList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { Location } from '../services/locationsApi'

export default function LocationsRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleLocationCreated = (location: Location) => {
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
      title="Locations"
      description="Physical sites and prefixes used across visits and guard workflows."
      actions={
        <ViewToggle
          aria-label="Locations view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'Add location', icon: PlusIcon },
            { id: 'list', label: 'All locations', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'New location' : 'Locations'}
        subtitle={
          activeView === 'create'
            ? 'Create a location record in the database.'
            : 'Table data is loaded from the Locations API.'
        }
      >
        {activeView === 'create' && (
          <LocationForm
            onSuccess={handleLocationCreated}
            onError={(error) => console.error('Error creating location:', error)}
          />
        )}
        {activeView === 'list' && <LocationList key={refreshKey} onRefresh={handleRefreshNeeded} />}
      </ContentCard>
    </PageLayout>
  )
}
