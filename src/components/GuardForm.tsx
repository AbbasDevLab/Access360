import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createGuard } from '../services/guardsApi'
import { getAllLocations } from '../services/locationsApi'
import type { Guard, ApiError } from '../services/guardsApi'
import type { Location } from '../services/locationsApi'

interface GuardFormProps {
  onSuccess?: (guard: Guard) => void
  onError?: (error: string) => void
}

export default function GuardForm({
  onSuccess,
  onError,
}: GuardFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<Guard>>({
    id: '',
    guardFullName: '',
    guardCode: '',
    username: '',
    guardEmail: '',
    guardPassword: '',
    guardPhone: '',
    guardStatus: true,
    guardLocationIdpk: null,
    guardIsDisabled: false,
    guardCreatedBy: 'System',
  })
  const [locations, setLocations] = useState<Location[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const locationsData = await getAllLocations()
        setLocations(locationsData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await createGuard(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          id: '',
          guardFullName: '',
          guardCode: '',
          username: '',
          guardEmail: '',
          guardPassword: '',
          guardPhone: '',
          guardStatus: true,
          guardLocationIdpk: null,
          guardIsDisabled: false,
          guardCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create guard'
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

  const handleInputChange = (field: keyof Guard, value: string | boolean | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="id" className="text-sm font-medium text-neutral-700">
            Guard ID <span className="text-red-500">*</span>
          </label>
          <input
            id="id"
            type="text"
            value={formData.id}
            onChange={(e) => handleInputChange('id', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="guardFullName" className="text-sm font-medium text-neutral-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="guardFullName"
            type="text"
            value={formData.guardFullName}
            onChange={(e) => handleInputChange('guardFullName', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="username" className="text-sm font-medium text-neutral-700">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="guardEmail" className="text-sm font-medium text-neutral-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="guardEmail"
            type="email"
            value={formData.guardEmail}
            onChange={(e) => handleInputChange('guardEmail', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="guardPassword" className="text-sm font-medium text-neutral-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="guardPassword"
            type="password"
            value={formData.guardPassword}
            onChange={(e) => handleInputChange('guardPassword', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="guardPhone" className="text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            id="guardPhone"
            type="tel"
            value={formData.guardPhone || ''}
            onChange={(e) => handleInputChange('guardPhone', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="guardCode" className="text-sm font-medium text-neutral-700">
            Guard Code
          </label>
          <input
            id="guardCode"
            type="text"
            value={formData.guardCode || ''}
            onChange={(e) => handleInputChange('guardCode', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="guardLocationIdpk" className="text-sm font-medium text-neutral-700">
            Location
          </label>
          <select
            id="guardLocationIdpk"
            value={formData.guardLocationIdpk || ''}
            onChange={(e) => handleInputChange('guardLocationIdpk', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Location</option>
            {locations.map((location) => (
              <option key={location.idpk} value={location.idpk}>
                {location.locName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.guardStatus || false}
              onChange={(e) => handleInputChange('guardStatus', e.target.checked)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active Status</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.guardIsDisabled || false}
              onChange={(e) => handleInputChange('guardIsDisabled', e.target.checked)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Disabled</span>
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
          <span className="text-sm text-green-700">Guard created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.id?.trim() || !formData.guardFullName?.trim() || !formData.username?.trim() || !formData.guardEmail?.trim() || !formData.guardPassword?.trim()}
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
          'Create Guard'
        )}
      </button>
    </form>
  )
}

