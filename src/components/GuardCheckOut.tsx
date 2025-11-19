import React, { useState } from 'react'
import { ArrowLeftIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { getActiveGuestVisits, updateGuestVisit } from '../services/guestVisitApi'
import { getGuestByCNIC, getGuestByCode } from '../services/guestsApi'
import type { GuestVisit, ApiError } from '../services/guestVisitApi'

interface GuardCheckOutProps {
  onBack: () => void
  onSuccess: () => void
}

export default function GuardCheckOut({ onBack, onSuccess }: GuardCheckOutProps): JSX.Element {
  const [searchType, setSearchType] = useState<'name' | 'cnic' | 'card'>('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [visits, setVisits] = useState<GuestVisit[]>([])
  const [selectedVisit, setSelectedVisit] = useState<GuestVisit | null>(null)
  const [cardReturned, setCardReturned] = useState(true)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setStatus('idle')
    setErrorMessage('')
    setVisits([])
    setSelectedVisit(null)

    try {
      const activeVisits = await getActiveGuestVisits()
      let filtered: GuestVisit[] = []

      if (searchType === 'name') {
        filtered = activeVisits.filter(v => 
          v.guest?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      } else if (searchType === 'cnic') {
        // First get guest by CNIC, then find their active visits
        try {
          const guest = await getGuestByCNIC(searchQuery)
          filtered = activeVisits.filter(v => v.guestID === guest.idpk)
        } catch (error) {
          // Guest not found
        }
      } else if (searchType === 'card') {
        filtered = activeVisits.filter(v => 
          v.rfidCardNumber?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      if (filtered.length === 0) {
        setErrorMessage('No active visits found. Visitor may have already checked out.')
      } else if (filtered.length === 1) {
        setSelectedVisit(filtered[0])
      } else {
        setVisits(filtered)
      }
    } catch (error) {
      setStatus('error')
      const apiError = error as ApiError
      setErrorMessage(apiError.message || 'Error searching for visits')
    } finally {
      setSearching(false)
    }
  }

  const handleCheckOut = async () => {
    if (!selectedVisit) return

    setIsProcessing(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      await updateGuestVisit(selectedVisit.idpk, {
        TimeOut: new Date().toISOString(),
        IsRFIDCardReturned: cardReturned,
        Notes: notes || undefined,
      })

      setStatus('success')
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      setStatus('error')
      const apiError = error as ApiError
      setErrorMessage(apiError.message || 'Failed to process check-out')
    } finally {
      setIsProcessing(false)
    }
  }

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
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check Out - Visitor Exit</h2>
          <p className="text-neutral-600">Search for visitor to process exit</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSearchType('name')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'name'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              By Name
            </button>
            <button
              onClick={() => setSearchType('cnic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'cnic'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              By CNIC
            </button>
            <button
              onClick={() => setSearchType('card')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              By Card Number
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  searchType === 'name' ? 'Enter visitor name...' :
                  searchType === 'cnic' ? 'Enter CNIC number...' :
                  'Enter card number...'
                }
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Multiple Results */}
        {visits.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Multiple Active Visits Found</h3>
            <div className="space-y-3">
              {visits.map((visit) => (
                <div
                  key={visit.idpk}
                  onClick={() => setSelectedVisit(visit)}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="font-medium text-neutral-900">{visit.guest?.fullName || 'Unknown'}</div>
                  <div className="text-sm text-neutral-600">
                    Checked in: {visit.timeIn ? new Date(visit.timeIn).toLocaleString() : 'N/A'}
                  </div>
                  {visit.rfidCardNumber && (
                    <div className="text-sm text-neutral-600">Card: {visit.rfidCardNumber}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Visit Details */}
        {selectedVisit && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Visitor Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Name</div>
                  <div className="font-medium text-neutral-900">{selectedVisit.guest?.fullName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">CNIC</div>
                  <div className="font-medium text-neutral-900">{selectedVisit.guest?.cnicNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Time In</div>
                  <div className="font-medium text-neutral-900">
                    {selectedVisit.timeIn ? new Date(selectedVisit.timeIn).toLocaleString() : 'N/A'}
                  </div>
                </div>
                {selectedVisit.rfidCardNumber && (
                  <div>
                    <div className="text-sm text-neutral-600">Card Number</div>
                    <div className="font-medium text-neutral-900">{selectedVisit.rfidCardNumber}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cardReturned}
                  onChange={(e) => setCardReturned(e.target.checked)}
                  className="size-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-neutral-700">RFID Card Returned</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                placeholder="Any additional notes..."
              />
            </div>

            {status === 'error' && errorMessage && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700">{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Visitor checked out successfully!</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedVisit(null)
                  setSearchQuery('')
                  setVisits([])
                }}
                className="flex-1 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium px-6 py-3 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Complete Check Out'
                )}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && !selectedVisit && errorMessage && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

