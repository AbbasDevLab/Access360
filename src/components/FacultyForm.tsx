import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createFaculty, type Faculty, type ApiError } from '../services/facultyApi'

interface FacultyFormProps {
  onSuccess?: (faculty: Faculty) => void
  onError?: (error: string) => void
}

export default function FacultyForm({
  onSuccess,
  onError,
}: FacultyFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<Partial<Faculty>>({
    facultyId: '',
    facultyFullName: '',
    facultyCode: '',
    username: '',
    facultyEmail: '',
    facultyPassword: '',
    facultyPhone: '',
    facultyStatus: true,
    facultyIsDisabled: false,
    facultyCreatedBy: 'System',
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
      const response = await createFaculty(formData)
      setSubmitStatus('success')
      if (onSuccess) onSuccess(response as Faculty)

      setTimeout(() => {
        setFormData({
          facultyId: '',
          facultyFullName: '',
          facultyCode: '',
          username: '',
          facultyEmail: '',
          facultyPassword: '',
          facultyPhone: '',
          facultyStatus: true,
          facultyIsDisabled: false,
          facultyCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      let message = apiError.message || 'Failed to create faculty'
      if (apiError.errors) {
        const validationMessages = Object.entries(apiError.errors)
          .map(([key, value]: [string, any]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ')
        message = validationMessages || message
      }
      setErrorMessage(message)
      if (onError) onError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Faculty, value: string | boolean | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="facultyId" className="text-sm font-medium text-neutral-700">
            Faculty ID <span className="text-red-500">*</span>
          </label>
          <input
            id="facultyId"
            type="text"
            value={formData.facultyId}
            onChange={(e) => handleInputChange('facultyId', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="facultyFullName" className="text-sm font-medium text-neutral-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="facultyFullName"
            type="text"
            value={formData.facultyFullName}
            onChange={(e) => handleInputChange('facultyFullName', e.target.value)}
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
          <label htmlFor="facultyEmail" className="text-sm font-medium text-neutral-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="facultyEmail"
            type="email"
            value={formData.facultyEmail}
            onChange={(e) => handleInputChange('facultyEmail', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="facultyPassword" className="text-sm font-medium text-neutral-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="facultyPassword"
            type="password"
            value={formData.facultyPassword}
            onChange={(e) => handleInputChange('facultyPassword', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="facultyPhone" className="text-sm font-medium text-neutral-700">
            Phone
          </label>
          <input
            id="facultyPhone"
            type="tel"
            value={formData.facultyPhone || ''}
            onChange={(e) => handleInputChange('facultyPhone', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="facultyCode" className="text-sm font-medium text-neutral-700">
            Faculty Code
          </label>
          <input
            id="facultyCode"
            type="text"
            value={formData.facultyCode || ''}
            onChange={(e) => handleInputChange('facultyCode', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.facultyStatus || false}
              onChange={(e) => handleInputChange('facultyStatus', e.target.checked)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active Status</span>
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
          <span className="text-sm text-green-700">Faculty created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          !formData.facultyId?.trim() ||
          !formData.facultyFullName?.trim() ||
          !formData.username?.trim() ||
          !formData.facultyEmail?.trim() ||
          !formData.facultyPassword?.trim()
        }
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Creating...' : 'Create Faculty'}
      </button>
    </form>
  )
}
