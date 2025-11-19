import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createAdminUser, getAllCompanies } from '../services/adminApi'
import { getAllLocations } from '../services/locationsApi'
import type { AdminUser, ApiError, Company } from '../services/adminApi'
import type { Location } from '../services/locationsApi'

interface AdminUserFormProps {
  onSuccess?: (user: AdminUser) => void
  onError?: (error: string) => void
}

export default function AdminUserForm({
  onSuccess,
  onError,
}: AdminUserFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    id: '',
    userFullName: '',
    userCode: '',
    username: '',
    userEmail: '',
    userPassword: '',
    userDateOfBirth: '',
    userStatus: true,
    userLocationIdpk: null,
    userCompanyIdpk: null,
    userIsDisabled: false,
    userCreatedBy: 'System',
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesData, locationsData] = await Promise.all([
          getAllCompanies(),
          getAllLocations(),
        ])
        setCompanies(companiesData)
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
      const response = await createAdminUser(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          id: '',
          userFullName: '',
          userCode: '',
          username: '',
          userEmail: '',
          userPassword: '',
          userDateOfBirth: '',
          userStatus: true,
          userLocationIdpk: null,
          userCompanyIdpk: null,
          userIsDisabled: false,
          userCreatedBy: 'System',
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create admin user'
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

  const handleInputChange = (field: keyof AdminUser, value: string | boolean | number | null) => {
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
            User ID <span className="text-red-500">*</span>
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
          <label htmlFor="userFullName" className="text-sm font-medium text-neutral-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="userFullName"
            type="text"
            value={formData.userFullName}
            onChange={(e) => handleInputChange('userFullName', e.target.value)}
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
          <label htmlFor="userEmail" className="text-sm font-medium text-neutral-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={(e) => handleInputChange('userEmail', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="userPassword" className="text-sm font-medium text-neutral-700">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="userPassword"
            type="password"
            value={formData.userPassword}
            onChange={(e) => handleInputChange('userPassword', e.target.value)}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="userCode" className="text-sm font-medium text-neutral-700">
            User Code
          </label>
          <input
            id="userCode"
            type="text"
            value={formData.userCode || ''}
            onChange={(e) => handleInputChange('userCode', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="userCompanyIdpk" className="text-sm font-medium text-neutral-700">
            Company
          </label>
          <select
            id="userCompanyIdpk"
            value={formData.userCompanyIdpk || ''}
            onChange={(e) => handleInputChange('userCompanyIdpk', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Company</option>
            {companies.map((company) => (
              <option key={company.idpk} value={company.idpk}>
                {company.cmpName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="userLocationIdpk" className="text-sm font-medium text-neutral-700">
            Location
          </label>
          <select
            id="userLocationIdpk"
            value={formData.userLocationIdpk || ''}
            onChange={(e) => handleInputChange('userLocationIdpk', e.target.value ? parseInt(e.target.value) : null)}
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
              checked={formData.userStatus || false}
              onChange={(e) => handleInputChange('userStatus', e.target.checked)}
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
              checked={formData.userIsDisabled || false}
              onChange={(e) => handleInputChange('userIsDisabled', e.target.checked)}
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
          <span className="text-sm text-green-700">Admin user created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.id?.trim() || !formData.userFullName?.trim() || !formData.username?.trim() || !formData.userEmail?.trim() || !formData.userPassword?.trim()}
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
          'Create Admin User'
        )}
      </button>
    </form>
  )
}

