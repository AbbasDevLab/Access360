import React from 'react'

type PageLayoutProps = {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

/** Shared page chrome — matches guard desk (light gray page, white cards). */
export function PageLayout({ title, description, actions, children }: PageLayoutProps): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-600">{description}</p>
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

/** Primary surface for forms and lists — white card on gray page (guard desk style). */
export function ContentCard({ title, subtitle, children, className = '' }: ContentCardProps): React.JSX.Element {
  return (
    <section
      className={`rounded-[20px] bg-white p-6 shadow-md shadow-black/8 ring-1 ring-black/5 sm:p-8 ${className}`.trim()}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title ? <h2 className="text-lg font-bold text-neutral-900">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}
