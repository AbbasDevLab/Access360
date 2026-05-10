import React from 'react'

/**
 * Wraps guard check-in/out when shown inside the admin portal so light “guard desk”
 * styling is not overridden by global `.portal-theme` dark rules.
 */
export default function AdminGuardDeskShell({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="guard-desk-theme -mx-4 w-[calc(100%+2rem)] max-w-none sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      {children}
    </div>
  )
}
