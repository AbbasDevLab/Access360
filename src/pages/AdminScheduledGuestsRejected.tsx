import { useEffect, useState } from 'react'
import {
  getRejectedGuestFacultyVisits,
  type GuestFacultyVisit,
} from '../api/guestFacultyVisit'

/** Convert the backend's "HH:mm:ss" (or "HH:mm") visit time to a 12-hour
 *  string like "11:35 PM". Falls back to the raw value if it can't parse. */
function formatVisitTime12h(raw: string | null | undefined): string {
  if (!raw) return ''
  const m = /^(\d{1,2}):(\d{2})/.exec(raw)
  if (!m) return raw
  let h = parseInt(m[1], 10)
  const mins = m[2]
  if (Number.isNaN(h)) return raw
  const period = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${mins} ${period}`
}

interface Props {
  dateFrom?: string
  dateTo?: string
}

export default function AdminScheduledGuestsRejected({
  dateFrom,
  dateTo,
}: Props = {}): React.JSX.Element {
  const [rejected, setRejected] = useState<GuestFacultyVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await getRejectedGuestFacultyVisits()
      // Sort newest first by createdAt; fall back to id for ties / missing dates.
      const sorted = [...data].sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0
        if (tb !== ta) return tb - ta
        return (b.id ?? 0) - (a.id ?? 0)
      })
      setRejected(sorted)
    } catch (err: unknown) {
      // The backend currently exposes only Pending and Approved list endpoints
      // for faculty visits. A 404 here means "no listing endpoint for rejected
      // exists yet" — surface that clearly instead of a raw HTTP error.
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined
      if (status === 404) {
        setErrorMessage(
          'Rejected faculty visit list is not yet available on the backend. Ask your backend developer to add a GetRejectedGuestFacultyVisits endpoint.',
        )
      } else {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Failed to load rejected visits'
        setErrorMessage(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const visible = rejected.filter((req) => {
    const ymd = (req.visitDate || '').substring(0, 10)
    if (dateFrom && ymd < dateFrom) return false
    if (dateTo && ymd > dateTo) return false
    return true
  })

  if (loading) return <div className="text-neutral-600">Loading rejected visits...</div>
  if (errorMessage) return <div className="text-sm text-red-700">{errorMessage}</div>
  if (visible.length === 0)
    return (
      <div className="text-neutral-500">
        {rejected.length === 0 ? 'No rejected visits' : 'No rejected visits in the selected date range'}
      </div>
    )

  return (
    <div className="space-y-3">
      {visible.map((req) => (
        <div
          key={req.id}
          className="flex items-start justify-between rounded-xl border border-red-200 bg-neutral-50 px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-neutral-900">{req.guestFullName}</div>
            <div className="text-sm text-neutral-900">
              {req.departmentName} · {req.visitDate.substring(0, 10)} {formatVisitTime12h(req.visitTime)}
            </div>
            <div className="mt-1 text-xs text-neutral-900">
              Faculty: <span>{req.facultyFullName ?? 'Unknown faculty'}</span>
            </div>
            {req.visitPurpose && (
              <div className="mt-1 text-xs text-neutral-900">Purpose: {req.visitPurpose}</div>
            )}
            {req.approvalRemarks && req.approvalRemarks.trim() !== '' && (
              <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-900">
                <span className="font-semibold">Rejection remarks:</span> {req.approvalRemarks}
              </div>
            )}
          </div>
          <span className="ml-3 shrink-0 self-start rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">
            Rejected
          </span>
        </div>
      ))}
    </div>
  )
}
