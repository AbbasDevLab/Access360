import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createVisitorType } from '../services/visitorTypesApi'
import type { VisitorType, ApiError } from '../services/visitorTypesApi'

interface VisitorTypeFormProps {
  onSuccess?: (visitorType: VisitorType) => void
  onError?: (error: string) => void
}

export default function VisitorTypeForm({
  onSuccess,
  onError,
}: VisitorTypeFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<VisitorType>>({
    vTypeName: '',
    vTypeStatus: true,
    idpk: 0, // Auto-increment - not user-editable
    vTypeCreatedBy: 'System',
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
      const response = await createVisitorType(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          vTypeName: '',
          vTypeStatus: true,
          idpk: 0, // Auto-increment - not user-editable
          vTypeCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create visitor type'
      if (apiError.errors) {
        const validationMessages = Object.entries(apiError.errors)
          .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
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

  const handleInputChange = (field: keyof VisitorType, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <label htmlFor="vTypeName" className="text-sm font-medium text-neutral-700">
          Visitor Type Name <span className="text-red-500">*</span>
        </label>
        <input
          id="vTypeName"
          type="text"
          value={formData.vTypeName}
          onChange={(e) => handleInputChange('vTypeName', e.target.value)}
          required
          disabled={isSubmitting}
          className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          placeholder="e.g., Student, Staff, Visitor"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="vTypeStatus" className="text-sm font-medium text-neutral-700">
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="vTypeStatus"
              checked={formData.vTypeStatus === true}
              onChange={() => handleInputChange('vTypeStatus', true)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="vTypeStatus"
              checked={formData.vTypeStatus === false}
              onChange={() => handleInputChange('vTypeStatus', false)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Inactive</span>
          </label>
        </div>
      </div>


      {submitStatus === 'error' && errorMessage && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{errorMessage}</span>
        </div>
      )}

      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircleIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">Visitor type created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.vTypeName?.trim()}
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
          'Create Visitor Type'
        )}
      </button>
    </form>
  )
}

