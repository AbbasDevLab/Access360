import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createGuest } from '../services/guestsApi'
import type { Guest, ApiError } from '../services/guestsApi'

interface GuestFormProps {
  onSuccess?: (guest: Guest) => void
  onError?: (error: string) => void
}

export default function GuestForm({
  onSuccess,
  onError,
}: GuestFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<Guest>>({
    fullName: '',
    fatherName: '',
    gender: '',
    country: '',
    dob: '',
    cnicNumber: '',
    phoneNumber: '',
    address: '',
    guestCode: '',
    guestStatus: true,
    idpk: 1,
    guestCreatedBy: 'System',
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
      const response = await createGuest(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          fullName: '',
          fatherName: '',
          gender: '',
          country: '',
          dob: '',
          cnicNumber: '',
          phoneNumber: '',
          address: '',
          guestCode: '',
          guestStatus: true,
          idpk: 1,
          guestCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create guest'
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

  const handleInputChange = (field: keyof Guest, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="fullName" className="text-sm font-medium text-neutral-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="fatherName" className="text-sm font-medium text-neutral-700">
            Father Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fatherName"
            type="text"
            value={formData.fatherName}
            onChange={(e) => handleInputChange('fatherName', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <label htmlFor="gender" className="text-sm font-medium text-neutral-700">
            Gender
          </label>
          <select
            id="gender"
            value={formData.gender || ''}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="country" className="text-sm font-medium text-neutral-700">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={formData.country || ''}
            onChange={(e) => handleInputChange('country', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="dob" className="text-sm font-medium text-neutral-700">
            Date of Birth
          </label>
          <input
            id="dob"
            type="text"
            value={formData.dob || ''}
            onChange={(e) => handleInputChange('dob', e.target.value)}
            disabled={isSubmitting}
            placeholder="YYYY-MM-DD"
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="cnicNumber" className="text-sm font-medium text-neutral-700">
            CNIC Number <span className="text-red-500">*</span>
          </label>
          <input
            id="cnicNumber"
            type="text"
            value={formData.cnicNumber}
            onChange={(e) => handleInputChange('cnicNumber', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
            placeholder="12345-1234567-1"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium text-neutral-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="address" className="text-sm font-medium text-neutral-700">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          required
          disabled={isSubmitting}
          rows={3}
          className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="guestCode" className="text-sm font-medium text-neutral-700">
            Guest Code <span className="text-red-500">*</span>
          </label>
          <input
            id="guestCode"
            type="text"
            value={formData.guestCode}
            onChange={(e) => handleInputChange('guestCode', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="idpk" className="text-sm font-medium text-neutral-700">
            ID PK
          </label>
          <input
            id="idpk"
            type="number"
            value={formData.idpk || ''}
            onChange={(e) => handleInputChange('idpk', parseInt(e.target.value) || 1)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="guestStatus" className="text-sm font-medium text-neutral-700">
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="guestStatus"
              checked={formData.guestStatus === true}
              onChange={() => handleInputChange('guestStatus', true)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Active</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="guestStatus"
              checked={formData.guestStatus === false}
              onChange={() => handleInputChange('guestStatus', false)}
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
          <span className="text-sm text-green-700">Guest created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.fullName?.trim() || !formData.fatherName?.trim() || !formData.cnicNumber?.trim() || !formData.phoneNumber?.trim() || !formData.address?.trim() || !formData.guestCode?.trim()}
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
          'Create Guest'
        )}
      </button>
    </form>
  )
}

