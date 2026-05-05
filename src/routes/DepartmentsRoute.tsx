import React, { useState } from 'react'
import { PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import DepartmentCategoryForm from '../components/DepartmentCategoryForm'
import DepartmentCategoryList from '../components/DepartmentCategoryList'
import { ContentCard, PageLayout } from '../components/layout/PageLayout'
import { ViewToggle } from '../components/layout/ViewToggle'
import type { DepartmentCategory } from '../services/departmentApi'

export default function DepartmentsRoute(): React.JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCategoryCreated = (category: DepartmentCategory) => {
    if (activeView === 'list') {
      setRefreshKey((prev) => prev + 1)
    } else {
      setTimeout(() => {
        setActiveView('list')
        setRefreshKey((prev) => prev + 1)
      }, 2000)
    }
  }

  const handleCategoryError = (error: string) => {
    console.error('Error creating category:', error)
  }

  const handleRefreshNeeded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <PageLayout
      title="Departments"
      description="Organize your site with department categories. Lists and forms use live API data."
      actions={
        <ViewToggle
          aria-label="Departments view"
          value={activeView}
          onChange={setActiveView}
          options={[
            { id: 'create', label: 'Add category', icon: PlusIcon },
            { id: 'list', label: 'Categories', icon: ListBulletIcon },
          ]}
        />
      }
    >
      <ContentCard
        title={activeView === 'create' ? 'New category' : 'Department categories'}
        subtitle={
          activeView === 'create'
            ? 'Define a label used when assigning visits and guests.'
            : 'Edit or remove categories stored in the database.'
        }
      >
        {activeView === 'create' && (
          <DepartmentCategoryForm onSuccess={handleCategoryCreated} onError={handleCategoryError} />
        )}
        {activeView === 'list' && (
          <DepartmentCategoryList key={refreshKey} onRefresh={handleRefreshNeeded} />
        )}
      </ContentCard>
    </PageLayout>
  )
}
