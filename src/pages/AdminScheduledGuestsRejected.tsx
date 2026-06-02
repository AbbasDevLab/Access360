import { useEffect, useState } from 'react'
import {
  getRejectedGuestFacultyVisits,
  type GuestFacultyVisit,
} from '../api/guestFacultyVisit'

export default function AdminScheduledGuestsRejected(): React.JSX.Element {
  const [rejected, setRejected] = useState<GuestFacultyVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await getRejectedGuestFacultyVisits()
      setRejected(data)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to load rejected visits'
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  if (loading) return <div className="text-neutral-600">Loading rejected visits...</div>
  if (errorMessage) return <div className="text-sm text-red-700">{errorMessage}</div>
  if (rejected.length === 0) return <div className="text-neutral-500">No rejected visits</div>

  return (
    <div className="space-y-3">
      {rejected.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded-xl border border-red-200 bg-neutral-50 px-4 py-3"
        >
          <div>
            <div className="font-semibold text-neutral-900">{req.guestFullName}</div>
            <div className="text-sm text-neutral-900">
              {req.departmentName} · {req.visitDate.substring(0, 10)} {req.visitTime}
            </div>
            <div className="mt-1 text-xs text-neutral-900">
              Faculty: <span>{req.facultyFullName ?? 'Unknown faculty'}</span>
            </div>
            {req.visitPurpose && (
              <div className="mt-1 text-xs text-neutral-900">Purpose: {req.visitPurpose}</div>
            )}
          </div>
          <span className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">
            Rejected
          </span>
        </div>
      ))}
    </div>
  )
}
