import React, { useState, useEffect } from 'react'
import { ArrowLeftIcon, MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getActiveGuestVisits, updateGuestVisit } from '../services/guestVisitApi'
import { getGuestByCNIC, getGuestByCode } from '../services/guestsApi'
import type { GuestVisit, ApiError } from '../services/guestVisitApi'
import { formatPktDateTime, formatPktTime, parseAccess360ApiInstant } from '../utils/pktTime'

interface GuardCheckOutProps {
  onBack: () => void
  onSuccess: () => void
  headerContextLabel?: string
}

const GUARD_PAGE = 'min-h-screen bg-[#e8eaed] p-4 pb-10 md:p-6'
const GUARD_CARD = 'rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5 sm:p-8'
const guardLabel = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500'
const guardInput =
  'w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-3 pl-10 pr-4 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#ED1C24] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/25'

export default function GuardCheckOut({
  onBack,
  onSuccess,
  headerContextLabel = 'Guard',
}: GuardCheckOutProps): React.JSX.Element {
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
  const [activeVisitsList, setActiveVisitsList] = useState<GuestVisit[]>([])
  const [checkingOut, setCheckingOut] = useState<number | null>(null)

  useEffect(() => {
    const loadActiveVisits = async () => {
      try {
        const visits = await getActiveGuestVisits()
        setActiveVisitsList(visits)
      } catch (error) {
        console.error('Error loading active visits:', error)
      }
    }

    loadActiveVisits()
    // Refresh every 30 seconds
    const interval = setInterval(loadActiveVisits, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return 'N/A'
    return formatPktTime(timeString)
  }

  const getTimeInDuration = (timeIn?: string | null) => {
    if (!timeIn) return 'N/A'
    const inTime = parseAccess360ApiInstant(timeIn)
    if (!inTime) return 'N/A'
    const now = new Date()
    const diffMs = now.getTime() - inTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const handleQuickCheckout = async (visit: GuestVisit) => {
    if (checkingOut === visit.idpk) return

    setCheckingOut(visit.idpk)
    try {
      await updateGuestVisit(visit.idpk, {
        TimeOut: new Date().toISOString(),
        IsRFIDCardReturned: true,
      })
      
      // Refresh the list
      const visits = await getActiveGuestVisits()
      setActiveVisitsList(visits)
      
      // Call onSuccess to refresh dashboard
      onSuccess()
    } catch (error) {
      console.error('Error checking out visitor:', error)
      alert('Failed to checkout visitor. Please try again.')
    } finally {
      setCheckingOut(null)
    }
  }

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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ED1C24] text-xs font-bold text-white shadow-md shadow-[#ED1C24]/30">
              OUT
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{headerContextLabel}</p>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 md:text-2xl">Check out — visitor exit</h2>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            Pick someone from the active list or search by name, CNIC, or card number.
          </p>
        </div>

        {activeVisitsList.length > 0 && (
          <div className={GUARD_CARD}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                <ClockIcon className="h-6 w-6 shrink-0 text-[#2563eb]" aria-hidden />
                Active on site ({activeVisitsList.length})
              </h2>
            </div>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {activeVisitsList.map((visit) => (
                <div
                  key={visit.idpk}
                  className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 transition-colors hover:border-neutral-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-neutral-900">{visit.guest?.fullName || 'Unknown visitor'}</div>
                    <div className="mt-1 text-sm text-neutral-600">
                      <span>CNIC {visit.guest?.cnicNumber || 'N/A'}</span>
                      {visit.rfidCardNumber && <span className="ml-3">Card {visit.rfidCardNumber}</span>}
                      <span className="ml-3">
                        In {formatTime(visit.timeIn)} ({getTimeInDuration(visit.timeIn)})
                      </span>
                    </div>
                    {visit.departmentCategory?.categoryName && (
                      <div className="mt-1 text-xs text-neutral-500">
                        Destination: {visit.departmentCategory.categoryName}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickCheckout(visit)}
                    disabled={checkingOut === visit.idpk}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ED1C24] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#ED1C24]/25 transition-colors hover:bg-[#d91820] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
                  >
                    {checkingOut === visit.idpk ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                        Processing…
                      </>
                    ) : (
                      <>
                        <ArrowLeftIcon className="h-4 w-4 rotate-180" aria-hidden />
                        Check out
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={GUARD_CARD}>
          <p className="mb-3 text-sm font-semibold text-neutral-900">Search by</p>
          <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Search type">
            {(['name', 'cnic', 'card'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSearchType(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  searchType === key
                    ? 'bg-[#ED1C24] text-white shadow-md shadow-[#ED1C24]/25'
                    : 'border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50'
                }`}
              >
                {key === 'name' ? 'Name' : key === 'cnic' ? 'CNIC' : 'Card number'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <label htmlFor="guard-checkout-search" className="sr-only">
                Search query
              </label>
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" aria-hidden />
              <input
                id="guard-checkout-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={
                  searchType === 'name'
                    ? 'Visitor name…'
                    : searchType === 'cnic'
                      ? 'CNIC…'
                      : 'Card number…'
                }
                className={guardInput}
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="rounded-xl bg-[#ED1C24] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ED1C24]/30 transition-colors hover:bg-[#d91820] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none sm:shrink-0"
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </div>
        </div>

        {visits.length > 1 && (
          <div className={GUARD_CARD}>
            <h3 className="mb-4 text-lg font-bold text-neutral-900">Multiple visits — choose one</h3>
            <div className="space-y-3">
              {visits.map((visit) => (
                <button
                  key={visit.idpk}
                  type="button"
                  onClick={() => setSelectedVisit(visit)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-left transition-colors hover:border-[#ED1C24]/40 hover:bg-white"
                >
                  <div className="font-medium text-neutral-900">{visit.guest?.fullName || 'Unknown'}</div>
                  <div className="text-sm text-neutral-600">
                    Checked in: {visit.timeIn ? formatPktDateTime(visit.timeIn) : 'N/A'}
                  </div>
                  {visit.rfidCardNumber && (
                    <div className="text-sm text-neutral-600">Card: {visit.rfidCardNumber}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedVisit && (
          <div className={`${GUARD_CARD} space-y-6`}>
            <div>
              <h3 className="mb-4 text-lg font-bold text-neutral-900">Visitor details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className={guardLabel}>Name</div>
                  <div className="text-base font-medium text-neutral-900">{selectedVisit.guest?.fullName || 'N/A'}</div>
                </div>
                <div>
                  <div className={guardLabel}>CNIC</div>
                  <div className="text-base font-medium text-neutral-900">{selectedVisit.guest?.cnicNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className={guardLabel}>Time in</div>
                  <div className="text-base font-medium text-neutral-900">
                    {selectedVisit.timeIn ? formatPktDateTime(selectedVisit.timeIn) : 'N/A'}
                  </div>
                </div>
                {selectedVisit.rfidCardNumber && (
                  <div>
                    <div className={guardLabel}>Card number</div>
                    <div className="font-mono text-base font-medium text-neutral-900">{selectedVisit.rfidCardNumber}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-1 py-1 hover:border-neutral-200">
                <input
                  type="checkbox"
                  checked={cardReturned}
                  onChange={(e) => setCardReturned(e.target.checked)}
                  className="size-4 rounded border-neutral-300 bg-white text-[#ED1C24] focus:ring-2 focus:ring-[#ED1C24]/25"
                />
                <span className="text-sm font-semibold text-neutral-900">RFID card returned</span>
              </label>
            </div>

            <div>
              <label htmlFor="guard-checkout-notes" className="mb-1.5 block text-sm font-semibold text-neutral-900">
                Notes <span className="font-normal text-neutral-500">(optional)</span>
              </label>
              <textarea
                id="guard-checkout-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:border-[#ED1C24] focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/25"
                placeholder="Anything security should know…"
              />
            </div>

            {status === 'error' && errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                <XCircleIcon className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-start gap-3 rounded-xl border border-[#00A651]/30 bg-green-50 p-4 text-sm text-neutral-900">
                <CheckCircleIcon className="h-5 w-5 shrink-0 text-[#00A651]" aria-hidden />
                <span>Visitor checked out successfully.</span>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedVisit(null)
                  setSearchQuery('')
                  setVisits([])
                }}
                className="flex-1 rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={isProcessing}
                className="flex-1 rounded-xl bg-[#ED1C24] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#ED1C24]/30 transition-colors hover:bg-[#d91820] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing…
                  </span>
                ) : (
                  'Complete check-out'
                )}
              </button>
            </div>
          </div>
        )}

        {status === 'error' && !selectedVisit && errorMessage && (
          <div className={GUARD_CARD}>
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <XCircleIcon className="h-5 w-5 shrink-0 text-red-700" aria-hidden />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


