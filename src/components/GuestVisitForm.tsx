import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createGuestVisit } from '../services/guestVisitApi'
import { getAllGuests } from '../services/guestsApi'
import { getAllVisitorTypes } from '../services/visitorTypesApi'
import { getAllCategories, getDepartmentsByCategory, departmentDisplayName } from '../services/departmentApi'
import { getAllLocations } from '../services/locationsApi'
import type { GuestVisit, ApiError } from '../services/guestVisitApi'
import type { Guest } from '../services/guestsApi'
import type { VisitorType } from '../services/visitorTypesApi'
import type { DepartmentCategory, Department } from '../services/departmentApi'
import type { Location } from '../services/locationsApi'
import SearchableSelect from './SearchableSelect'

interface GuestVisitFormProps {
  onSuccess?: (visit: GuestVisit) => void
  onError?: (error: string) => void
}

export default function GuestVisitForm({
  onSuccess,
  onError,
}: GuestVisitFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<Partial<GuestVisit>>({
    guestID: 0,
    guestCode: '',
    visitorTypeId: null,
    departmentCategoryIdpk: null,
    departmentIdpk: null,
    locationIdpk: null,
    timeIn: new Date().toISOString(),
    maxTimeMinutes: null,
    notes: '',
    visitPurpose: '',
    isAppointment: false,
    isEscortRequired: false,
    rfidCardNumber: '',
    idpk: 0,
  })
  const [guests, setGuests] = useState<Guest[]>([])
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([])
  const [categories, setCategories] = useState<DepartmentCategory[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [guestsData, typesData, categoriesData, locationsData] = await Promise.all([
          getAllGuests(),
          getAllVisitorTypes(),
          getAllCategories(),
          getAllLocations(),
        ])
        setGuests(guestsData)
        setVisitorTypes(typesData)
        setCategories(categoriesData)
        setLocations(locationsData.filter((l) => l.locStatus))
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const catId = formData.departmentCategoryIdpk
    if (!catId) {
      setDepartments([])
      return
    }
    let cancelled = false
    setDepartmentsLoading(true)
    getDepartmentsByCategory(catId)
      .then((rows) => {
        if (!cancelled) {
          setDepartments(rows.filter((d) => d.departmentStatus !== false))
        }
      })
      .catch((err) => {
        console.error('Failed to load departments:', err)
        if (!cancelled) setDepartments([])
      })
      .finally(() => {
        if (!cancelled) setDepartmentsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [formData.departmentCategoryIdpk])

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
          locationIdpk: null,
          timeIn: new Date().toISOString(),
          maxTimeMinutes: null,
          notes: '',
          visitPurpose: '',
          isAppointment: false,
          isEscortRequired: false,
          rfidCardNumber: '',
          idpk: 0, // Auto-increment - not user-editable
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
        <SearchableSelect
          id="visitorTypeId"
          label="Visitor type"
          value={formData.visitorTypeId != null ? String(formData.visitorTypeId) : ''}
          onChange={(v) => handleInputChange('visitorTypeId', v ? parseInt(v, 10) : null)}
          options={visitorTypes.map((type) => ({
            value: String(type.idpk),
            label: type.vTypeName,
          }))}
          disabled={isSubmitting}
          placeholder="Search visitor types…"
          emptyListMessage="No visitor types"
        />

        <SearchableSelect
          id="departmentCategoryIdpk"
          label="Department category (destination)"
          value={formData.departmentCategoryIdpk != null ? String(formData.departmentCategoryIdpk) : ''}
          onChange={(v) => {
            handleInputChange('departmentCategoryIdpk', v ? parseInt(v, 10) : null)
            handleInputChange('departmentIdpk', null)
          }}
          options={categories
            .filter((c) => c.categoryStatus !== false)
            .map((c) => ({ value: String(c.idpk), label: c.categoryName }))}
          disabled={isSubmitting}
          placeholder="Search categories…"
          emptyListMessage="No categories"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <SearchableSelect
            id="departmentIdpk"
            label={
              <span>
                Department <span className="font-normal text-neutral-500">(optional)</span>
              </span>
            }
            value={formData.departmentIdpk != null ? String(formData.departmentIdpk) : ''}
            onChange={(v) => handleInputChange('departmentIdpk', v ? parseInt(v, 10) : null)}
            options={departments.map((d) => ({
              value: String(d.idpk),
              label: departmentDisplayName(d),
            }))}
            disabled={isSubmitting || !formData.departmentCategoryIdpk || departmentsLoading}
            placeholder={
              !formData.departmentCategoryIdpk
                ? 'Pick a category first…'
                : departmentsLoading
                  ? 'Loading departments…'
                  : 'Search departments…'
            }
            emptyListMessage={
              formData.departmentCategoryIdpk ? 'No departments for this category' : 'Select a category first'
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <SearchableSelect
          id="locationIdpk"
          label={
            <span>
              Location / site <span className="font-normal text-neutral-500">(optional)</span>
            </span>
          }
          value={formData.locationIdpk != null ? String(formData.locationIdpk) : ''}
          onChange={(v) => handleInputChange('locationIdpk', v ? parseInt(v, 10) : null)}
          options={locations.map((loc) => ({
            value: String(loc.idpk),
            label: [loc.locPrefix, loc.locName].filter(Boolean).join(' — ') || `Location #${loc.idpk}`,
          }))}
          disabled={isSubmitting}
          placeholder="Search locations…"
          emptyListMessage="No locations"
        />
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


