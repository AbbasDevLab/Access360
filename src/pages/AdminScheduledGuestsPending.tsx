import { useEffect, useState } from 'react'
import {
  getPendingGuestFacultyVisits,
  approveGuestFacultyVisit,
  rejectGuestFacultyVisit,
  type GuestFacultyVisit,
} from '../api/guestFacultyVisit'

const getCurrentAdminId = (): number | null => {
  try {
    const stored = localStorage.getItem('adminUser')
    if (!stored) return null
    const user = JSON.parse(stored)
    const rawId = user?.id
    if (typeof rawId === 'number') return rawId
    if (typeof rawId === 'string') {
      const parsed = parseInt(rawId, 10)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  } catch {
    return null
  }
}

export default function AdminScheduledGuestsPending(): React.JSX.Element {
  const [pending, setPending] = useState<GuestFacultyVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getPendingGuestFacultyVisits()
      setPending(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleApprove = async (id: number) => {
    const adminId = getCurrentAdminId()
    if (!adminId) {
      alert('Admin session not found. Please log in again.')
      return
    }
    try {
      await approveGuestFacultyVisit(id, adminId)
      await load()
    } catch (error: any) {
      console.error('Approve guest faculty visit failed:', error)
      alert(error?.message || 'Failed to approve request')
    }
  }

  const handleReject = async (id: number) => {
    const adminId = getCurrentAdminId()
    if (!adminId) {
      alert('Admin session not found. Please log in again.')
      return
    }
    try {
      const note = rejectNote.trim()
      await rejectGuestFacultyVisit(id, adminId, note.length > 0 ? note : undefined)
      await load()
    } catch (error: any) {
      console.error('Reject guest faculty visit failed:', error)
      alert(error?.message || 'Failed to reject request')
    } finally {
      setRejectingId(null)
      setRejectNote('')
    }
  }

  if (loading) return <div className="text-neutral-600">Loading pending requests...</div>
  if (pending.length === 0) return <div className="text-neutral-500">No pending requests</div>

  return (
    <div className="space-y-3">
      {pending.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3"
        >
          <div>
            <div className="font-semibold text-neutral-900">{req.guestFullName}</div>
            <div className="text-sm text-neutral-600">
              {req.departmentName} · {req.visitDate.substring(0, 10)} {req.visitTime}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Faculty: <span>{req.facultyFullName ?? 'Unknown faculty'}</span>
            </div>
            {req.visitPurpose && (
              <div className="text-xs text-neutral-500 mt-1">
                Purpose: {req.visitPurpose}
              </div>
            )}
          </div>
          <div className="space-x-2">
            <button
              onClick={() => void handleApprove(req.id)}
              className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => setRejectingId(req.id)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      {rejectingId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => {
              setRejectingId(null)
              setRejectNote('')
            }}
            aria-hidden
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl shadow-black/60">
            <h3 className="text-lg font-semibold text-neutral-900">Reject request</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Optional: add a note so the faculty knows why it was rejected.
            </p>

            <label htmlFor="reject-note" className="mt-4 block text-sm font-medium text-neutral-800">
              Rejection note (optional)
            </label>
            <textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
              placeholder="e.g. CNIC mismatch, incomplete details, wrong date/time, policy reason…"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null)
                  setRejectNote('')
                }}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleReject(rejectingId)}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


