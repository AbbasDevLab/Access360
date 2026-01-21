import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { getAllScheduledGuests, approveScheduledGuest, rejectScheduledGuest, type ScheduledGuest } from '../services/scheduledGuestsApi'

export default function ScheduledGuestsApproval(): React.JSX.Element {
  const [scheduledGuests, setScheduledGuests] = useState<ScheduledGuest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState<{ [key: number]: string }>({})
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null)

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
    return <div className="text-neutral-300 text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-neutral-700 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-neutral-100 mb-4">Scheduled Guests Approval</h2>
        
        {/* Pending Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-200 mb-3">Pending Requests ({pendingGuests.length})</h3>
          {pendingGuests.length === 0 ? (
            <p className="text-neutral-400">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingGuests.map((guest) => (
                <div key={guest.idpk} className="bg-neutral-600 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-neutral-100">{guest.guestFullName}</h4>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium">Pending</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-neutral-300 mb-3">
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
                          <div><strong>Arrived At:</strong> {new Date(guest.arrivedAt).toLocaleString()}</div>
                        )}
                        {guest.visitStatus === 'NoShow' && (
                          <div><strong>Visit Status:</strong> No Show</div>
                        )}
                      </div>
                      {showRejectModal === guest.idpk && (
                        <div className="mt-3 p-3 bg-neutral-700 rounded border border-neutral-500">
                          <label className="block text-sm font-medium text-neutral-200 mb-2">Rejection Reason:</label>
                          <textarea
                            value={rejectReason[guest.idpk] || ''}
                            onChange={(e) => setRejectReason({ ...rejectReason, [guest.idpk]: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                              className="px-4 py-1 bg-neutral-500 hover:bg-neutral-400 text-neutral-100 rounded text-sm"
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
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
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
        </div>

        {/* Approved Requests */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-neutral-200 mb-3">Approved ({approvedGuests.length})</h3>
          {approvedGuests.length === 0 ? (
            <p className="text-neutral-400">No approved requests</p>
          ) : (
            <div className="space-y-2">
              {approvedGuests.slice(0, 5).map((guest) => (
                <div key={guest.idpk} className="bg-neutral-600 rounded-lg p-3 border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-100">{guest.guestFullName}</span>
                      <span className="ml-3 text-sm text-neutral-300">
                        {new Date(guest.scheduledDate).toLocaleDateString()} at {guest.scheduledTime}
                        {guest.carNumber && ` • Car: ${guest.carNumber}`}
                      </span>
                      <div className="text-xs text-neutral-300 mt-1">
                        Faculty: {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk}) • Purpose: {guest.purpose}
                        {guest.arrivedAt && ` • Arrived: ${new Date(guest.arrivedAt).toLocaleString()}`}
                        {guest.visitStatus === 'NoShow' && ' • No Show'}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected Requests */}
        {rejectedGuests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-200 mb-3">Rejected ({rejectedGuests.length})</h3>
            <div className="space-y-2">
              {rejectedGuests.slice(0, 5).map((guest) => (
                <div key={guest.idpk} className="bg-neutral-600 rounded-lg p-3 border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-neutral-100">{guest.guestFullName}</span>
                      {guest.rejectionReason && (
                        <span className="ml-3 text-sm text-red-300">Reason: {guest.rejectionReason}</span>
                      )}
                      <div className="text-xs text-neutral-300 mt-1">
                        Faculty: {guest.facultyName || 'Unknown'} (ID: {guest.facultyIdpk}) • Purpose: {guest.purpose}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs font-medium">Rejected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

