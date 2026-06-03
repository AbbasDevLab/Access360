import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getAllScheduledGuests, approveScheduledGuest, rejectScheduledGuest, type ScheduledGuest } from '../services/scheduledGuestsApi'
import { formatPktDateTime, getPktTodayYmd, toPktYmd } from '../utils/pktTime'
import AdminScheduledGuestsPending from '../pages/AdminScheduledGuestsPending'
import AdminScheduledGuestsApproved from '../pages/AdminScheduledGuestsApproved'
import AdminScheduledGuestsRejected from '../pages/AdminScheduledGuestsRejected'

type StatusTab = 'pending' | 'approved' | 'rejected'

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

export default function ScheduledGuestsApproval(): React.JSX.Element {
  const [scheduledGuests, setScheduledGuests] = useState<ScheduledGuest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({})
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)
  const [statusTab, setStatusTab] = useState<StatusTab>('pending')
  // Default range = yesterday → today in PKT. Operators usually only care
  // about the immediate window of arrivals; they can widen the range as
  // needed with the date inputs.
  const [dateFrom, setDateFrom] = useState(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return toPktYmd(yesterday)
  })
  const [dateTo, setDateTo] = useState(() => getPktTodayYmd())

  useEffect(() => {
    loadScheduledGuests()
  }, [])

  const loadScheduledGuests = async () => {
    setIsLoading(true)
    try {
      const guests = await getAllScheduledGuests()
      setScheduledGuests(guests)
    } catch (error) {
      console.error('Error loading scheduled guests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this scheduled guest request?')) return
    try {
      await approveScheduledGuest(id)
      await loadScheduledGuests()
    } catch (error: any) {
      alert(error.message || 'Failed to approve request')
    }
  }

  const handleReject = async (id: number) => {
    const reason = rejectReason[id] || ''
    if (!reason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    if (!confirm('Reject this scheduled guest request?')) return
    try {
      await rejectScheduledGuest(id, reason)
      setRejectReason({ ...rejectReason, [id]: '' })
      setShowRejectModal(null)
      await loadScheduledGuests()
    } catch (error: any) {
      alert(error.message || 'Failed to reject request')
    }
  }

  const pendingGuests = scheduledGuests.filter(g => g.status === 'Pending')
  const approvedGuests = scheduledGuests.filter(g => g.status === 'Approved')
  const rejectedGuests = scheduledGuests.filter(g => g.status === 'Rejected')

  if (isLoading) {
    return <div className="text-neutral-600 text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] bg-white shadow-md shadow-black/8 ring-1 ring-black/5 p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-neutral-900">Scheduled Guests Approval</h2>
          <div
            role="tablist"
            aria-label="Request status"
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1"
          >
            {STATUS_TABS.map((t) => {
              const isActive = statusTab === t.id
              const count =
                t.id === 'pending'
                  ? pendingGuests.length
                  : t.id === 'approved'
                    ? approvedGuests.length
                    : rejectedGuests.length
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusTab(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#00A651] text-white shadow-sm'
                      : 'text-neutral-700 hover:bg-white hover:text-neutral-900'
                  }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex flex-col">
            <label htmlFor="sg-date-from" className="text-xs font-semibold text-neutral-700">
              Visit date from
            </label>
            <input
              id="sg-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="sg-date-to" className="text-xs font-semibold text-neutral-700">
              Visit date to
            </label>
            <input
              id="sg-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
              }}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
            >
              Clear dates
            </button>
          )}
        </div>

        {statusTab === 'pending' && (
          <>
            {/* Pending Faculty Visit Requests (from new API) */}
            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Faculty visit requests</h3>
              <AdminScheduledGuestsPending dateFrom={dateFrom} dateTo={dateTo} />
            </section>

            {/* Existing Pending Scheduled Guests */}
            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Scheduled guests ({pendingGuests.length})</h3>
              {pendingGuests.length === 0 ? (
                <p className="text-neutral-500">No pending scheduled guest requests</p>
              ) : (
            <div className="space-y-3">
              {pendingGuests.map((guest) => (
                <div key={guest.idpk} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 border border-yellow-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-neutral-900">{guest.guestFullName}</h4>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">Pending</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-neutral-600 mb-3">
                        <div><strong>CNIC:</strong> {guest.guestCNIC}</div>
                        <div><strong>Phone:</strong> {guest.guestPhone}</div>
                        {guest.carNumber && <div><strong>Car Number:</strong> {guest.carNumber}</div>}
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <strong>Scheduled:</strong> {new Date(guest.scheduledDate).toLocaleDateString()} at {guest.scheduledTime}
                        </div>
                        <div><strong>Purpose:</strong> {guest.purpose}</div>
                        <div><strong>Faculty:</strong> {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk})</div>
                        {guest.arrivedAt && (
                          <div><strong>Arrived At:</strong> {formatPktDateTime(guest.arrivedAt)}</div>
                        )}
                        {guest.visitStatus === 'NoShow' && (
                          <div><strong>Visit Status:</strong> No Show</div>
                        )}
                      </div>
                      {showRejectModal === guest.idpk && (
                        <div className="mt-3 p-3 rounded-xl border border-neutral-200 bg-white border-neutral-500">
                          <label className="block text-sm font-medium text-neutral-800 mb-2">Rejection Reason:</label>
                          <textarea
                            value={rejectReason[guest.idpk] || ''}
                            onChange={(e) => setRejectReason({ ...rejectReason, [guest.idpk]: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                            rows={2}
                            placeholder="Enter reason for rejection..."
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleReject(guest.idpk)}
                              className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => {
                                setShowRejectModal(null)
                                setRejectReason({ ...rejectReason, [guest.idpk]: '' })
                              }}
                              className="px-4 py-1 bg-neutral-500 hover:bg-neutral-400 text-neutral-900 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(guest.idpk)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00A651] hover:bg-[#009148] text-white rounded-lg text-sm font-medium"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(guest.idpk)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              )}
            </section>
          </>
        )}

        {statusTab === 'approved' && (
          <section>
            <h3 className="text-lg font-semibold text-neutral-800 mb-3">Approved faculty visit requests</h3>
            <AdminScheduledGuestsApproved dateFrom={dateFrom} dateTo={dateTo} />
          </section>
        )}

        {statusTab === 'rejected' && (
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Rejected faculty visit requests</h3>
              <AdminScheduledGuestsRejected dateFrom={dateFrom} dateTo={dateTo} />
            </section>

            <section>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                Rejected scheduled guests ({rejectedGuests.length})
              </h3>
              {rejectedGuests.length === 0 ? (
                <p className="text-neutral-500">No rejected scheduled guests</p>
              ) : (
                <div className="space-y-2">
                  {rejectedGuests.map((guest) => (
                    <div key={guest.idpk} className="rounded-xl border border-red-500/30 bg-neutral-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-neutral-900">{guest.guestFullName}</span>
                          {guest.rejectionReason && (
                            <span className="ml-3 text-sm text-red-700">Reason: {guest.rejectionReason}</span>
                          )}
                          <div className="text-xs text-neutral-600 mt-1">
                            Faculty: {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk}) • Purpose: {guest.purpose}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">Rejected</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


