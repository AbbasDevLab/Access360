import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdminGuardDeskShell from '../components/AdminGuardDeskShell'
import GuardCheckIn from '../components/GuardCheckIn'

/**
 * Same check-in flow as the guard portal, available to signed-in admins.
 */
export default function AdminCheckInRoute(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <AdminGuardDeskShell>
      <GuardCheckIn
        guestCreatedBy="Admin"
        headerContextLabel="Admin"
        onBack={() => navigate('/dashboard', { replace: true })}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
    </AdminGuardDeskShell>
  )
}
