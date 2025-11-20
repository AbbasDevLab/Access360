import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createLocation } from '../services/locationsApi'
import type { Location, ApiError } from '../services/locationsApi'

interface LocationFormProps {
  onSuccess?: (location: Location) => void
  onError?: (error: string) => void
}

export default function LocationForm({
  onSuccess,
  onError,
}: LocationFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<Location>>({
    locPrefix: '',
    locName: '',
    locStatus: true,
    idpk: 0, // Auto-increment - not user-editable
    locCreatedBy: 'System',
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
      const response = await createLocation(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          locPrefix: '',
          locName: '',
          locStatus: true,
          idpk: 0, // Auto-increment - not user-editable
          locCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create location'
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

  const handleInputChange = (field: keyof Location, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="locPrefix" className="text-sm font-medium text-neutral-700">
            Location Prefix <span className="text-red-500">*</span>
          </label>
          <input
            id="locPrefix"
            type="text"
            value={formData.locPrefix}
            onChange={(e) => handleInputChange('locPrefix', e.target.value)}
            required
            maxLength={10}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="e.g., MAIN, BLDG1"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="locName" className="text-sm font-medium text-neutral-700">
            Location Name <span className="text-red-500">*</span>
          </label>
          <input
            id="locName"
            type="text"
            value={formData.locName}
            onChange={(e) => handleInputChange('locName', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="e.g., Main Building"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="locStatus" className="text-sm font-medium text-neutral-700">
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="locStatus"
              checked={formData.locStatus === true}
              onChange={() => handleInputChange('locStatus', true)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="locStatus"
              checked={formData.locStatus === false}
              onChange={() => handleInputChange('locStatus', false)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Inactive</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="locPhone" className="text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            id="locPhone"
            type="tel"
            value={formData.locPhone || ''}
            onChange={(e) => handleInputChange('locPhone', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="locEmail" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="locEmail"
            type="email"
            value={formData.locEmail || ''}
            onChange={(e) => handleInputChange('locEmail', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="locCode" className="text-sm font-medium text-neutral-700">
          Location Code
        </label>
        <input
          id="locCode"
          type="text"
          value={formData.locCode || ''}
          onChange={(e) => handleInputChange('locCode', e.target.value)}
          disabled={isSubmitting}
          className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        />
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
          <span className="text-sm text-green-700">Location created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.locPrefix?.trim() || !formData.locName?.trim()}
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
          'Create Location'
        )}
      </button>
    </form>
  )
}

