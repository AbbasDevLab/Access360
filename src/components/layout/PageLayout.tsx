import React from 'react'

type PageLayoutProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

/**
 * Consistent page chrome: title hierarchy, optional actions (filters, toggles),
 * and readable line length for HCI scan patterns.
 */
export function PageLayout({ title, description, actions, children }: PageLayoutProps): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  )
}

type ContentCardProps = {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

/** Primary surface for forms and lists (matches portal dark theme). */
export function ContentCard({ title, subtitle, children, className = '' }: ContentCardProps): React.JSX.Element {
  return (
    <section
      className={`rounded-2xl border border-neutral-700/90 bg-neutral-800/40 p-6 shadow-sm shadow-black/20 sm:p-8 ${className}`.trim()}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title ? <h2 className="text-lg font-semibold text-neutral-100">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-neutral-400">{subtitle}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}
