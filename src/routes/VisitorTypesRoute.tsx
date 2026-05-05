import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import VisitorTypeForm from '../components/VisitorTypeForm'
import VisitorTypeList from '../components/VisitorTypeList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { VisitorType } from '../services/visitorTypesApi'

export default function VisitorTypesRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleVisitorTypeCreated = (visitorType: VisitorType) => {
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
      title="Visitor types"
      description="Labels used on visits, reports, and enrollment — synced from your visitor-types API."
      actions={
        <ViewToggle
          aria-label="Visitor types view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'Add type', icon: PlusIcon },
            { id: 'list', label: 'All types', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'New visitor type' : 'Visitor types'}
        subtitle={
          activeView === 'create'
            ? 'Add a type visitors can select when checking in.'
            : 'Manage types returned from the database.'
        }
      >
        {activeView === 'create' && (
          <VisitorTypeForm
            onSuccess={handleVisitorTypeCreated}
            onError={(error) => console.error('Error creating visitor type:', error)}
          />
        )}
        {activeView === 'list' && <VisitorTypeList key={refreshKey} onRefresh={handleRefreshNeeded} />}
      </ContentCard>
    </PageLayout>
  )
}
