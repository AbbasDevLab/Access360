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
      await rejectGuestFacultyVisit(id, adminId)
      await load()
    } catch (error: any) {
      console.error('Reject guest faculty visit failed:', error)
      alert(error?.message || 'Failed to reject request')
    }
  }

  if (loading) return <div className="text-neutral-300">Loading pending requests...</div>
  if (pending.length === 0) return <div className="text-neutral-400">No pending requests</div>

  return (
    <div className="space-y-3">
      {pending.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded bg-neutral-700 px-4 py-3 border border-neutral-600"
        >
          <div>
            <div className="font-semibold text-neutral-100">{req.guestFullName}</div>
            <div className="text-sm text-neutral-300">
              {req.departmentName} · {req.visitDate.substring(0, 10)} {req.visitTime}
            </div>
            <div className="text-xs text-neutral-400 mt-1">
              Faculty: <span>{req.facultyFullName ?? 'Unknown faculty'}</span>
            </div>
            {req.visitPurpose && (
              <div className="text-xs text-neutral-400 mt-1">
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
              onClick={() => void handleReject(req.id)}
              className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

