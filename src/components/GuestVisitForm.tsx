import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createGuestVisit } from '../services/guestVisitApi'
import { getAllGuests } from '../services/guestsApi'
import { getAllVisitorTypes } from '../services/visitorTypesApi'
import { getAllCategories } from '../services/departmentApi'
import type { GuestVisit, ApiError } from '../services/guestVisitApi'
import type { Guest } from '../services/guestsApi'
import type { VisitorType } from '../services/visitorTypesApi'
import type { DepartmentCategory } from '../services/departmentApi'

interface GuestVisitFormProps {
  onSuccess?: (visit: GuestVisit) => void
  onError?: (error: string) => void
}

export default function GuestVisitForm({
  onSuccess,
  onError,
}: GuestVisitFormProps): JSX.Element {
  const [formData, setFormData] = useState<Partial<GuestVisit>>({
    guestID: 0,
    guestCode: '',
    visitorTypeId: null,
    departmentCategoryIdpk: null,
    departmentIdpk: null,
    timeIn: new Date().toISOString(),
    maxTimeMinutes: null,
    notes: '',
    visitPurpose: '',
    isAppointment: false,
    isEscortRequired: false,
    rfidCardNumber: '',
    idpk: 1,
  })
  const [guests, setGuests] = useState<Guest[]>([])
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([])
  const [categories, setCategories] = useState<DepartmentCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsData, typesData, categoriesData] = await Promise.all([
          getAllGuests(),
          getAllVisitorTypes(),
          getAllCategories(),
        ])
        setGuests(guestsData)
        setVisitorTypes(typesData)
        setCategories(categoriesData)
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
      const response = await createGuestVisit(formData)
      setSubmitStatus('success')
      
      if (onSuccess) {
        onSuccess(response as any)
      }

      setTimeout(() => {
        setFormData({
          guestID: 0,
          guestCode: '',
          visitorTypeId: null,
          departmentCategoryIdpk: null,
          departmentIdpk: null,
          timeIn: new Date().toISOString(),
          maxTimeMinutes: null,
          notes: '',
          visitPurpose: '',
          isAppointment: false,
          isEscortRequired: false,
          rfidCardNumber: '',
          idpk: 1,
        })
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      
      let message = apiError.message || 'Failed to create guest visit'
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

  const handleInputChange = (field: keyof GuestVisit, value: string | boolean | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const selectedGuest = guests.find(g => g.idpk === formData.guestID)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="guestID" className="text-sm font-medium text-neutral-700">
            Guest <span className="text-red-500">*</span>
          </label>
          <select
            id="guestID"
            value={formData.guestID || 0}
            onChange={(e) => {
              const guestId = parseInt(e.target.value)
              const guest = guests.find(g => g.idpk === guestId)
              handleInputChange('guestID', guestId)
              handleInputChange('guestCode', guest?.guestCode || '')
            }}
            required
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value={0}>Select Guest</option>
            {guests.map((guest) => (
              <option key={guest.idpk} value={guest.idpk}>
                {guest.fullName} ({guest.guestCode})
              </option>
            ))}
          </select>
        </div>

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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="visitorTypeId" className="text-sm font-medium text-neutral-700">
            Visitor Type
          </label>
          <select
            id="visitorTypeId"
            value={formData.visitorTypeId || ''}
            onChange={(e) => handleInputChange('visitorTypeId', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Visitor Type</option>
            {visitorTypes.map((type) => (
              <option key={type.idpk} value={type.idpk}>
                {type.vTypeName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="departmentCategoryIdpk" className="text-sm font-medium text-neutral-700">
            Department Category
          </label>
          <select
            id="departmentCategoryIdpk"
            value={formData.departmentCategoryIdpk || ''}
            onChange={(e) => handleInputChange('departmentCategoryIdpk', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.idpk} value={category.idpk}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label htmlFor="visitPurpose" className="text-sm font-medium text-neutral-700">
            Visit Purpose
          </label>
          <input
            id="visitPurpose"
            type="text"
            value={formData.visitPurpose || ''}
            onChange={(e) => handleInputChange('visitPurpose', e.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="maxTimeMinutes" className="text-sm font-medium text-neutral-700">
            Max Time (Minutes)
          </label>
          <input
            id="maxTimeMinutes"
            type="number"
            value={formData.maxTimeMinutes || ''}
            onChange={(e) => handleInputChange('maxTimeMinutes', e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSubmitting}
            className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="notes" className="text-sm font-medium text-neutral-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAppointment || false}
              onChange={(e) => handleInputChange('isAppointment', e.target.checked)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Is Appointment</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEscortRequired || false}
              onChange={(e) => handleInputChange('isEscortRequired', e.target.checked)}
              disabled={isSubmitting}
              className="size-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-neutral-700">Escort Required</span>
          </label>
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="rfidCardNumber" className="text-sm font-medium text-neutral-700">
          RFID Card Number
        </label>
        <input
          id="rfidCardNumber"
          type="text"
          value={formData.rfidCardNumber || ''}
          onChange={(e) => handleInputChange('rfidCardNumber', e.target.value)}
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
          <span className="text-sm text-green-700">Guest visit created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !formData.guestID || !formData.guestCode?.trim()}
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
          'Create Guest Visit'
        )}
      </button>
    </form>
  )
}

