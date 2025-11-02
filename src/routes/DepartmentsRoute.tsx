import React, { useState } from 'react'
import { BuildingOfficeIcon, PlusIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import DepartmentCategoryForm from '../components/DepartmentCategoryForm'
import type { DepartmentCategory } from '../services/departmentApi'

export default function DepartmentsRoute(): JSX.Element {
  const [activeView, setActiveView] = useState<'list' | 'create'>('create')

  const handleCategoryCreated = (category: DepartmentCategory) => {
    console.log('Category created:', category)
    // TODO: Refresh list if showing
    if (activeView === 'create') {
      // Optionally switch to list view
      // setActiveView('list')
    }
  }

  const handleCategoryError = (error: string) => {
    console.error('Error creating category:', error)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-3">
            <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            Department Management
          </h1>
          <p className="text-neutral-600 mt-2">
            Manage department categories and departments
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
            Add Category
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
            View Categories
          </button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'create' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Create New Department Category
            </h2>
            <p className="text-sm text-neutral-600">
              Add a new category to organize departments within your system.
            </p>
          </div>
          <DepartmentCategoryForm
            onSuccess={handleCategoryCreated}
            onError={handleCategoryError}
          />
        </div>
      )}

      {activeView === 'list' && (
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Department Categories
            </h2>
            <p className="text-sm text-neutral-600">
              View and manage all department categories.
            </p>
          </div>
          <div className="text-center py-12 text-neutral-500">
            <ListBulletIcon className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p>Categories list will be displayed here</p>
            <p className="text-sm mt-2">API endpoint: GET /Departments/GetAllCategories</p>
          </div>
        </div>
      )}

      {/* API Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          API Information
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div>
            <strong>Endpoint:</strong> POST <code className="bg-blue-100 px-2 py-1 rounded">/api/Departments/CreateDeptCategory/Category</code>
          </div>
          <div>
            <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">https://localhost:7215</code>
          </div>
          <div className="mt-4">
            <strong>Expected Response:</strong>
            <pre className="bg-blue-100 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
{`{
  "id": 1,
  "categoryName": "college department",
  "categoryStatus": true,
  "message": "Department category created successfully"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
