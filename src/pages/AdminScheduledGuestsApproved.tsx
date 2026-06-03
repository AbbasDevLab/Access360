import { useEffect, useState } from 'react'
import {
  getApprovedGuestFacultyVisits,
  type GuestFacultyVisit,
} from '../api/guestFacultyVisit'

interface Props {
  dateFrom?: string
  dateTo?: string
}

export default function AdminScheduledGuestsApproved({
  dateFrom,
  dateTo,
}: Props = {}): React.JSX.Element {
  const [approved, setApproved] = useState<GuestFacultyVisit[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getApprovedGuestFacultyVisits()
      setApproved(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const visible = approved.filter((req) => {
    const ymd = (req.visitDate || '').substring(0, 10)
    if (dateFrom && ymd < dateFrom) return false
    if (dateTo && ymd > dateTo) return false
    return true
  })

  if (loading) return <div className="text-neutral-600">Loading approved visits...</div>
  if (visible.length === 0)
    return (
      <div className="text-neutral-500">
        {approved.length === 0 ? 'No approved visits' : 'No approved visits in the selected date range'}
      </div>
    )

  return (
    <div className="space-y-3">
      {visible.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded-xl border border-emerald-200 bg-neutral-50 px-4 py-3"
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
          <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
            Approved
          </span>
        </div>
      ))}
    </div>
  )
}
