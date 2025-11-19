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
import CameraCapture from './CameraCapture'

interface GuardCheckInProps {
  onBack: () => void
  onSuccess: () => void
}

export default function GuardCheckIn({ onBack, onSuccess }: GuardCheckInProps): JSX.Element {
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
        cnicNumber: ocrResult.cnicNumber || prev.cnicNumber,
      }))
      
      // Check if guest already exists (if CNIC was extracted)
      if (ocrResult.cnicNumber) {
        await checkExistingGuest(ocrResult.cnicNumber)
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
          cnicNumber: formData.cnicNumber,
          phoneNumber: formData.phoneNumber,
          guestCode: `GUEST-${Date.now()}`,
          guestStatus: true,
          address: formData.address || 'Not provided',
          guestCreatedBy: 'Guard',
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Dashboard
            </button>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check In - Scan ID Card</h2>
            <p className="text-neutral-600">Please scan or upload the visitor's ID card</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <XCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <span className="text-sm text-yellow-700">{errorMessage}</span>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                  Upload ID Document
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  disabled={ocrProcessing}
                  className="block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {ocrProcessing && (
                  <div className="mt-4 text-center">
                    <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-2 text-sm text-neutral-600">Extracting information from ID card...</p>
                    <p className="mt-1 text-xs text-neutral-500">This may take a few seconds</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  <CameraIcon className="w-5 h-5 inline mr-2" />
                  Or Capture Photo
                </label>
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
                        setFormData(prev => ({
                          ...prev,
                          fullName: ocrResult.fullName || prev.fullName,
                          fatherName: ocrResult.fatherName || prev.fatherName,
                          cnicNumber: ocrResult.cnicNumber || prev.cnicNumber,
                        }))
                        
                        // Check if guest already exists (if CNIC was extracted)
                        if (ocrResult.cnicNumber) {
                          await checkExistingGuest(ocrResult.cnicNumber)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={() => setStep('scan')}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Scan
          </button>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check In - Visitor Details</h2>
          {existingGuest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              Returning visitor found. Details pre-filled.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* OCR Confidence and Raw Text Display */}
          {showOcrResults && ocrRawText && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">OCR Verification</h3>
                {ocrConfidence && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    ocrConfidence >= 80 ? 'bg-green-100 text-green-700' :
                    ocrConfidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    Confidence: {Math.round(ocrConfidence)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-700 mb-2">Raw OCR text (for manual verification):</p>
              <div className="bg-white border border-blue-200 rounded p-3 text-xs text-neutral-700 font-mono max-h-32 overflow-y-auto">
                {ocrRawText}
              </div>
              <button
                type="button"
                onClick={() => setShowOcrResults(false)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Hide
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Father Name
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                CNIC Number
              </label>
              <input
                type="text"
                value={formData.cnicNumber}
                onChange={(e) => handleInputChange('cnicNumber', e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="35202-1234567-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="0300-1234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="Enter address (optional)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Visitor Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.visitorTypeId}
                onChange={(e) => handleInputChange('visitorTypeId', e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="">Select Visitor Type</option>
                {visitorTypes.map((type) => (
                  <option key={type.idpk} value={type.idpk}>
                    {type.vTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.destinationId}
                onChange={(e) => handleInputChange('destinationId', e.target.value)}
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              >
                <option value="">Select Destination</option>
                {destinations.map((dest) => (
                  <option key={dest.idpk} value={dest.idpk}>
                    {dest.categoryName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Purpose of Visit
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="Meeting, Delivery, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Card Number Assigned
            </label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              placeholder="Enter RFID card number"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAppointment}
                onChange={(e) => handleInputChange('isAppointment', e.target.checked)}
                className="size-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-700">Has Appointment</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEscortRequired}
                onChange={(e) => handleInputChange('isEscortRequired', e.target.checked)}
                className="size-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-700">Escort Required</span>
            </label>
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
              <span className="text-sm text-green-700">Visitor checked in successfully!</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('scan')}
              className="flex-1 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium px-6 py-3 hover:bg-neutral-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Complete Check In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

