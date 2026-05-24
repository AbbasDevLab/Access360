import React from 'react'

/**
 * Full-bleed check-in/out under admin layout (same light desk page as guard counter).
 */
export default function AdminGuardDeskShell({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="-mx-4 w-[calc(100%+2rem)] max-w-none sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
      {children}
    </div>
  )
}

