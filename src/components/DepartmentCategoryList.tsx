import React, { useState, useEffect } from 'react'
import { TrashIcon, PencilIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import {
  getAllCategories,
  deleteDepartmentCategory,
  type DepartmentCategory,
  type ApiError,
} from '../services/departmentApi'

interface DepartmentCategoryListProps {
  onEdit?: (category: DepartmentCategory) => void
  onRefresh?: () => void // Called when list is refreshed (e.g., after delete)
}

export default function DepartmentCategoryList({
  onEdit,
  onRefresh,
}: DepartmentCategoryListProps): JSX.Element {
  const [categories, setCategories] = useState<DepartmentCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllCategories()
      setCategories(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      setDeletingId(id)
      await deleteDepartmentCategory(id)
      
      // Refresh list
      await fetchCategories()
      
      // Notify parent
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      const apiError = err as ApiError
      alert(apiError.message || 'Failed to delete category')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <XCircleIcon className="w-5 h-5 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
        <button
          onClick={fetchCategories}
          className="ml-auto text-sm text-red-600 hover:text-red-700 underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p>No categories found</p>
        <p className="text-sm mt-2">Create your first category to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {categories.map((category) => (
          <div
            key={category.idpk}
            className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                {category.categoryStatus ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-neutral-900">{category.categoryName}</h3>
                <div className="flex items-center gap-4 text-xs text-neutral-500 mt-1">
                  <span>ID: {category.idpk}</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    category.categoryStatus
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {category.categoryStatus ? 'Active' : 'Inactive'}
                  </span>
                  {category.categoryCreatedBy && (
                    <span>Created by: {category.categoryCreatedBy}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit category"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(category.idpk)}
                disabled={deletingId === category.idpk}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete category"
              >
                {deletingId === category.idpk ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

