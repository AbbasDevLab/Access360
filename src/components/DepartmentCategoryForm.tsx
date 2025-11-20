import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createDepartmentCategory } from '../services/departmentApi'
import type { DepartmentCategory, ApiError } from '../services/departmentApi'

interface DepartmentCategoryFormProps {
  onSuccess?: (category: DepartmentCategory) => void
  onError?: (error: string) => void
}

export default function DepartmentCategoryForm({
  onSuccess,
  onError,
}: DepartmentCategoryFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<DepartmentCategory>>({
    categoryName: '',
    categoryStatus: true,
    idpk: 0, // Auto-increment - not user-editable
    categoryCreatedBy: 'System',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await createDepartmentCategory(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          categoryName: '',
          categoryStatus: true,
          idpk: 0, // Auto-increment - not user-editable
          categoryCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      // Format validation errors if they exist
      let message = apiError.message || 'Failed to create category'
      if (apiError.errors) {
        const validationMessages = Object.entries(apiError.errors)
          .map(([key, value]: [string, any]) => {
            const fieldName = key.replace(/([A-Z])/g, ' $1').trim()
            return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`
          })
          .join('; ')
        message = validationMessages || message
      }
      
      setErrorMessage(message)
      
      if (onError) {
        onError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof DepartmentCategory, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div className="grid gap-2">
        <label htmlFor="categoryName" className="text-sm font-medium text-neutral-700">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          id="categoryName"
          type="text"
          value={formData.categoryName}
          onChange={(e) => handleInputChange('categoryName', e.target.value)}
          required
          disabled={isSubmitting}
          className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder="e.g., college department, academic department"
        />
      </div>

      {/* Category Status */}
      <div className="grid gap-2">
        <label htmlFor="categoryStatus" className="text-sm font-medium text-neutral-700">
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="categoryStatus"
              checked={formData.categoryStatus === true}
              onChange={() => handleInputChange('categoryStatus', true)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="categoryStatus"
              checked={formData.categoryStatus === false}
              onChange={() => handleInputChange('categoryStatus', false)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Inactive</span>
          </label>
        </div>
      </div>


      {/* Error Message */}
      {submitStatus === 'error' && errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">Category created successfully!</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !formData.categoryName.trim()}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </>
        ) : (
          'Create Category'
        )}
      </button>
    </form>
  )
}
