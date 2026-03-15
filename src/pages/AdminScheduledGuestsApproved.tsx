import { useEffect, useState } from 'react'
import {
  getApprovedGuestFacultyVisits,
  type GuestFacultyVisit,
} from '../api/guestFacultyVisit'

export default function AdminScheduledGuestsApproved(): React.JSX.Element {
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

  if (loading) return <div className="text-neutral-300">Loading approved visits...</div>
  if (approved.length === 0) return <div className="text-neutral-400">No approved visits</div>

  return (
    <div className="space-y-2">
      {approved.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded bg-neutral-700 px-4 py-3 border border-green-600/60"
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
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300">
            Approved
          </span>
        </div>
      ))}
    </div>
  )
}

