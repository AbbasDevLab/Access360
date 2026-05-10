import React from 'react'
import { useNavigate } from 'react-router-dom'
import AdminGuardDeskShell from '../components/AdminGuardDeskShell'
import GuardCheckOut from '../components/GuardCheckOut'

/**
 * Same check-out flow as the guard portal, available to signed-in admins.
 */
export default function AdminCheckOutRoute(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <AdminGuardDeskShell>
      <GuardCheckOut
        headerContextLabel="Admin"
        onBack={() => navigate('/dashboard', { replace: true })}
        onSuccess={() => navigate('/dashboard', { replace: true })}
      />
    </AdminGuardDeskShell>
  )
}
