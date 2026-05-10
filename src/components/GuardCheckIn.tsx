import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon, CameraIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { createGuest, getGuestByCNIC } from '../services/guestsApi'
import { createGuestVisit } from '../services/guestVisitApi'
import { getAllVisitorTypes } from '../services/visitorTypesApi'
import { getAllCategories } from '../services/departmentApi'
import { extractTextFromImage } from '../services/ocrService'
import type { Guest, ApiError } from '../services/guestsApi'
import type { VisitorType } from '../services/visitorTypesApi'
import type { DepartmentCategory } from '../services/departmentApi'
import { CNIC_MAX_INPUT_LENGTH, formatPakCnicInput } from '../utils/cnic'
import CameraCapture from './CameraCapture'

interface GuardCheckInProps {
  onBack: () => void
  onSuccess: () => void
  /** Stored on guest record (e.g. Guard vs Admin counter). */
  guestCreatedBy?: string
  /** Small label above the title (e.g. Guard vs Admin). */
  headerContextLabel?: string
}

const GUARD_PAGE = 'min-h-screen bg-[#e8eaed] p-4 pb-10 md:p-6'
const GUARD_CARD = 'rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5 sm:p-8'

/** Shared guard portal field styles — match Guard dashboard (green focus). */
const guardField = {
  label: 'mb-1.5 block text-sm font-semibold text-neutral-900',
  requiredMark: 'ml-0.5 text-red-600',
  input:
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25',
  inputOcr:
    'border-amber-300 bg-amber-50 font-semibold text-neutral-900 placeholder:text-amber-700/70',
  select:
    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-inner focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25',
} as const

function RequiredStar(): React.JSX.Element {
  return (
    <abbr title="required" className={guardField.requiredMark}>
      *
    </abbr>
  )
}

export default function GuardCheckIn({
  onBack,
  onSuccess,
  guestCreatedBy = 'Guard',
  headerContextLabel = 'Guard',
}: GuardCheckInProps): React.JSX.Element {
  const [step, setStep] = useState<'scan' | 'form'>('scan')
  const [capturedImage, setCapturedImage] = useState('')
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    cnicNumber: '',
    phoneNumber: '',
    address: '',
    visitorTypeId: '',
    destinationId: '',
    cardNumber: '',
    purpose: '',
    isAppointment: false,
    isEscortRequired: false,
  })
  const [visitorTypes, setVisitorTypes] = useState<VisitorType[]>([])
  const [destinations, setDestinations] = useState<DepartmentCategory[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [existingGuest, setExistingGuest] = useState<Guest | null>(null)
  const [showOcrResults, setShowOcrResults] = useState(false)
  const [ocrRawText, setOcrRawText] = useState('')
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>()
  const [ocrFilledFields, setOcrFilledFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, categoriesData] = await Promise.all([
          getAllVisitorTypes(),
          getAllCategories(),
        ])
        setVisitorTypes(typesData.filter(t => t.vTypeStatus))
        setDestinations(categoriesData.filter(c => c.categoryStatus))
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  const handleFileUpload = async (file: File) => {
    setOcrProcessing(true)
    setErrorMessage('')
    setCapturedImage('') // Clear any previous captured image
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Process OCR
      const ocrResult = await extractTextFromImage(imageData)
      
      // Log OCR results for debugging
      console.log('OCR Results:', {
        fullName: ocrResult.fullName,
        fatherName: ocrResult.fatherName,
        cnicNumber: ocrResult.cnicNumber,
        confidence: ocrResult.confidence,
        rawText: ocrResult.rawText.substring(0, 200) + '...', // First 200 chars
      })
      
      // Store raw text and confidence for manual verification
      setOcrRawText(ocrResult.rawText)
      setOcrConfidence(ocrResult.confidence)
      
      // Update form with OCR results
      setFormData(prev => ({
        ...prev,
        fullName: ocrResult.fullName || prev.fullName,
        fatherName: ocrResult.fatherName || prev.fatherName,
        cnicNumber: ocrResult.cnicNumber
          ? formatPakCnicInput(ocrResult.cnicNumber)
          : prev.cnicNumber,
      }))
      
      // Check if guest already exists (if CNIC was extracted)
      if (ocrResult.cnicNumber) {
        await checkExistingGuest(formatPakCnicInput(ocrResult.cnicNumber))
      }
      
      // Show warning if extraction was partial or confidence is low
      if (!ocrResult.fullName || !ocrResult.cnicNumber) {
        setErrorMessage(
          `Partial extraction: ${!ocrResult.fullName ? 'Name not found. ' : ''}${!ocrResult.cnicNumber ? 'CNIC not found. ' : ''}Please verify and correct manually.`
        )
        setShowOcrResults(true) // Show raw text for manual verification
      } else if (ocrResult.confidence && ocrResult.confidence < 70) {
        setErrorMessage(
          `Low OCR confidence (${Math.round(ocrResult.confidence)}%). Please verify extracted information carefully.`
        )
        setShowOcrResults(true) // Show raw text for verification
      } else {
        setErrorMessage('') // Clear any previous errors
        setShowOcrResults(false)
      }
      
      setOcrProcessing(false)
      setStep('form')
    } catch (error) {
      console.error('OCR processing error:', error)
      setOcrProcessing(false)
      setErrorMessage('Failed to process ID card. Please enter details manually.')
      // Still proceed to form even if OCR fails
      setStep('form')
    }
  }

  const checkExistingGuest = async (cnic: string) => {
    try {
      const guest = await getGuestByCNIC(cnic)
      setExistingGuest(guest)
      setFormData(prev => ({
        ...prev,
        fullName: guest.fullName,
        fatherName: guest.fatherName,
        cnicNumber: formatPakCnicInput(guest.cnicNumber || ''),
        phoneNumber: guest.phoneNumber,
        address: guest.address || '',
      }))
    } catch (error) {
      // Guest doesn't exist, will create new one
      setExistingGuest(null)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      let guestId: number
      let guestCode: string

      if (existingGuest) {
        // Use existing guest
        guestId = existingGuest.idpk
        guestCode = existingGuest.guestCode
      } else {
        // Create new guest
        const newGuest = await createGuest({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          cnicNumber: formatPakCnicInput(formData.cnicNumber),
          phoneNumber: formData.phoneNumber,
          guestCode: `GUEST-${Date.now()}`,
          guestStatus: true,
          address: formData.address || 'Not provided',
          guestCreatedBy,
        })
        guestId = newGuest.id || (newGuest as any).idpk
        guestCode = newGuest.guestCode || `GUEST-${Date.now()}`
      }

      // Create guest visit
      await createGuestVisit({
        guestID: guestId,
        guestCode: guestCode,
        visitorTypeId: formData.visitorTypeId ? parseInt(formData.visitorTypeId) : null,
        departmentCategoryIdpk: formData.destinationId ? parseInt(formData.destinationId) : null,
        visitPurpose: formData.purpose,
        isAppointment: formData.isAppointment,
        isEscortRequired: formData.isEscortRequired,
        rfidCardNumber: formData.cardNumber || null,
        timeIn: new Date().toISOString(),
      })

      setSubmitStatus('success')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      const apiError = error as ApiError
      setErrorMessage(apiError.message || 'Failed to process check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'scan') {
    return (
      <div className={GUARD_PAGE}>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className={GUARD_CARD}>
            <button
              type="button"
              onClick={onBack}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ArrowLeftIcon className="h-5 w-5 shrink-0" aria-hidden />
              Back to dashboard
            </button>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00A651] text-xs font-bold text-white shadow-md shadow-[#00A651]/30">
                IN
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{headerContextLabel}</p>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">Check in — scan ID</h2>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600">
              Upload a photo of the CNIC or capture it with the camera. Text is read automatically; you can fix anything on the next step.
            </p>
          </div>

          <div className={GUARD_CARD}>
            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <XCircleIcon className="h-5 w-5 shrink-0 text-amber-700" aria-hidden />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div className="space-y-3">
                <label htmlFor="guard-id-upload" className={guardField.label}>
                  <span className="inline-flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 shrink-0 text-[#00A651]" aria-hidden />
                    Upload ID image or PDF
                  </span>
                </label>
                <input
                  id="guard-id-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={ocrProcessing}
                  className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#00A651] file:px-4 file:py-2.5 file:font-semibold file:text-white file:shadow-md file:shadow-[#00A651]/30 hover:file:bg-[#009148] disabled:opacity-50"
                />
                {ocrProcessing && (
                  <div className="mt-6 text-center">
                    <svg className="mx-auto h-8 w-8 animate-spin text-[#00A651]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-sm font-medium text-neutral-900">Reading the ID…</p>
                    <p className="mt-1 text-xs text-neutral-500">Usually a few seconds</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className={guardField.label}>
                  <span className="inline-flex items-center gap-2">
                    <CameraIcon className="h-5 w-5 shrink-0 text-[#2563eb]" aria-hidden />
                    Or capture with camera
                  </span>
                </p>
                <CameraCapture
                  onCapture={async (image) => {
                    setCapturedImage(image)
                    setErrorMessage('') // Clear any previous errors
                    // Auto-process captured image with OCR
                    if (image) {
                      try {
                        setOcrProcessing(true)
                        // Process OCR directly from base64 image
                        const ocrResult = await extractTextFromImage(image)
                        
                        // Log OCR results for debugging
                        console.log('OCR Results:', {
                          fullName: ocrResult.fullName,
                          fatherName: ocrResult.fatherName,
                          cnicNumber: ocrResult.cnicNumber,
                          confidence: ocrResult.confidence,
                          rawText: ocrResult.rawText.substring(0, 200) + '...', // First 200 chars
                        })
                        
                        // Store raw text and confidence for manual verification
                        setOcrRawText(ocrResult.rawText)
                        setOcrConfidence(ocrResult.confidence)
                        
                        // Update form with OCR results
                        const filledFields = new Set<string>()
                        setFormData(prev => {
                          const updated = { ...prev }
                          if (ocrResult.fullName) {
                            updated.fullName = ocrResult.fullName
                            filledFields.add('fullName')
                          }
                          if (ocrResult.fatherName) {
                            updated.fatherName = ocrResult.fatherName
                            filledFields.add('fatherName')
                          }
                          if (ocrResult.cnicNumber) {
                            updated.cnicNumber = formatPakCnicInput(ocrResult.cnicNumber)
                            filledFields.add('cnicNumber')
                          }
                          return updated
                        })
                        setOcrFilledFields(filledFields)
                        
                        // Check if guest already exists (if CNIC was extracted)
                        if (ocrResult.cnicNumber) {
                          await checkExistingGuest(formatPakCnicInput(ocrResult.cnicNumber))
                        }
                        
                        // Show warning if extraction was partial or confidence is low
                        if (!ocrResult.fullName || !ocrResult.cnicNumber) {
                          setErrorMessage(
                            `Partial extraction: ${!ocrResult.fullName ? 'Name not found. ' : ''}${!ocrResult.cnicNumber ? 'CNIC not found. ' : ''}Please verify and correct manually.`
                          )
                          setShowOcrResults(true) // Show raw text for manual verification
                        } else if (ocrResult.confidence && ocrResult.confidence < 70) {
                          setErrorMessage(
                            `Low OCR confidence (${Math.round(ocrResult.confidence)}%). Please verify extracted information carefully.`
                          )
                          setShowOcrResults(true) // Show raw text for verification
                        } else {
                          setErrorMessage('') // Clear any previous errors
                          setShowOcrResults(false)
                        }
                        
                        setOcrProcessing(false)
                        setStep('form')
                      } catch (error) {
                        console.error('OCR processing error:', error)
                        setOcrProcessing(false)
                        setErrorMessage('Failed to process ID card. Please enter details manually.')
                        // Still proceed to form even if OCR fails
                        setStep('form')
                      }
                    }
                  }}
                  capturedImage={capturedImage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inputBase = (ocrKey: 'fullName' | 'fatherName' | 'cnicNumber') =>
    `${guardField.input} ${ocrFilledFields.has(ocrKey) ? guardField.inputOcr : ''}`.trim()

  return (
    <div className={GUARD_PAGE}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className={GUARD_CARD}>
          <button
            type="button"
            onClick={() => setStep('scan')}
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <ArrowLeftIcon className="h-5 w-5 shrink-0" aria-hidden />
            Back to scan
          </button>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00A651] text-xs font-bold text-white shadow-md shadow-[#00A651]/30">
              IN
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{headerContextLabel}</p>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">Check in — visitor details</h2>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Confirm identity and visit details. Fields marked with an asterisk are required before check-in.
          </p>
          {existingGuest ? (
            <div
              className="mt-4 rounded-xl border border-[#2563eb]/20 bg-blue-50 px-4 py-3 text-sm text-neutral-900"
              role="status"
            >
              Returning visitor — profile loaded from the database. Review and complete the visit section below.
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${GUARD_CARD}`}
        >
          {showOcrResults && ocrRawText && (
            <div className="rounded-xl border border-[#2563eb]/25 bg-blue-50 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-neutral-900">OCR verification</h3>
                {ocrConfidence != null && (
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      ocrConfidence >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : ocrConfidence >= 70
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Confidence: {Math.round(ocrConfidence)}%
                  </span>
                )}
              </div>
              <p className="mb-2 text-xs text-neutral-700">Raw text from the ID (for manual verification):</p>
              <div className="max-h-32 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-3 font-mono text-xs text-neutral-800">
                {ocrRawText}
              </div>
              <button
                type="button"
                onClick={() => setShowOcrResults(false)}
                className="mt-3 text-xs font-semibold text-[#2563eb] underline-offset-2 hover:text-[#1d4ed8] hover:underline"
              >
                Hide OCR panel
              </button>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label htmlFor="guard-full-name" className={guardField.label}>
                Full name
                <RequiredStar />
              </label>
              <input
                id="guard-full-name"
                type="text"
                autoComplete="name"
                value={formData.fullName}
                onChange={(e) => {
                  handleInputChange('fullName', e.target.value)
                  setOcrFilledFields((prev) => {
                    const next = new Set(prev)
                    if (!e.target.value) next.delete('fullName')
                    return next
                  })
                }}
                required
                className={inputBase('fullName')}
              />
            </div>

            <div>
              <label htmlFor="guard-father-name" className={guardField.label}>
                Husband / father name
              </label>
              <input
                id="guard-father-name"
                type="text"
                autoComplete="additional-name"
                value={formData.fatherName}
                onChange={(e) => {
                  handleInputChange('fatherName', e.target.value)
                  setOcrFilledFields((prev) => {
                    const next = new Set(prev)
                    if (!e.target.value) next.delete('fatherName')
                    return next
                  })
                }}
                className={inputBase('fatherName')}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label htmlFor="guard-cnic" className={guardField.label}>
                CNIC number
                <RequiredStar />
              </label>
              <input
                id="guard-cnic"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={CNIC_MAX_INPUT_LENGTH}
                title="13-digit CNIC (#####-#######-#)"
                value={formData.cnicNumber}
                onChange={(e) => {
                  const next = formatPakCnicInput(e.target.value)
                  handleInputChange('cnicNumber', next)
                  setOcrFilledFields((prev) => {
                    const s = new Set(prev)
                    if (!next) s.delete('cnicNumber')
                    return s
                  })
                }}
                required
                className={inputBase('cnicNumber')}
                placeholder="35202-1234567-1"
              />
            </div>

            <div>
              <label htmlFor="guard-phone" className={guardField.label}>
                Phone number
                <RequiredStar />
              </label>
              <input
                id="guard-phone"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                className={guardField.input}
                placeholder="0300-1234567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="guard-address" className={guardField.label}>
              Address <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <input
              id="guard-address"
              type="text"
              autoComplete="street-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={guardField.input}
              placeholder="Street, area, city"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label htmlFor="guard-visitor-type" className={guardField.label}>
                Visitor type
                <RequiredStar />
              </label>
              <select
                id="guard-visitor-type"
                value={formData.visitorTypeId}
                onChange={(e) => handleInputChange('visitorTypeId', e.target.value)}
                required
                className={guardField.select}
              >
                <option value="">Select visitor type…</option>
                {visitorTypes.map((type) => (
                  <option key={type.idpk} value={type.idpk}>
                    {type.vTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="guard-destination" className={guardField.label}>
                Destination
                <RequiredStar />
              </label>
              <select
                id="guard-destination"
                value={formData.destinationId}
                onChange={(e) => handleInputChange('destinationId', e.target.value)}
                required
                className={guardField.select}
              >
                <option value="">Select destination…</option>
                {destinations.map((dest) => (
                  <option key={dest.idpk} value={dest.idpk}>
                    {dest.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="guard-purpose" className={guardField.label}>
              Purpose of visit <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <input
              id="guard-purpose"
              type="text"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className={guardField.input}
              placeholder="e.g. meeting, delivery, interview"
            />
          </div>

          <div>
            <label htmlFor="guard-card" className={guardField.label}>
              RFID / card number <span className="font-normal text-neutral-500">(optional)</span>
            </label>
            <input
              id="guard-card"
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className={guardField.input}
              placeholder="Card handed to visitor"
            />
          </div>

          <fieldset className="flex flex-wrap gap-6 border-0 p-0">
            <legend className="sr-only">Visit flags</legend>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-1 py-1 hover:border-neutral-200">
              <input
                type="checkbox"
                checked={formData.isAppointment}
                onChange={(e) => handleInputChange('isAppointment', e.target.checked)}
                className="size-4 rounded border-neutral-300 bg-white text-[#00A651] focus:ring-2 focus:ring-[#00A651]/25"
              />
              <span className="text-sm font-medium text-neutral-900">Has appointment</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-1 py-1 hover:border-neutral-200">
              <input
                type="checkbox"
                checked={formData.isEscortRequired}
                onChange={(e) => handleInputChange('isEscortRequired', e.target.checked)}
                className="size-4 rounded border-neutral-300 bg-white text-[#00A651] focus:ring-2 focus:ring-[#00A651]/25"
              />
              <span className="text-sm font-medium text-neutral-900">Escort required</span>
            </label>
          </fieldset>

          {submitStatus === 'error' && errorMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <XCircleIcon className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitStatus === 'success' && (
            <div className="flex items-start gap-3 rounded-xl border border-[#00A651]/30 bg-green-50 p-4 text-sm text-neutral-900">
              <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#00A651]" aria-hidden />
              <span>Visitor checked in successfully.</span>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:gap-4">
            <button
              type="button"
              onClick={() => setStep('scan')}
              className="order-2 flex-1 rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50 sm:order-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 flex-1 rounded-xl bg-[#00A651] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#00A651]/30 transition-colors hover:bg-[#009148] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none sm:order-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing…
                </span>
              ) : (
                'Complete check-in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

