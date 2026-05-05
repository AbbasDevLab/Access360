import React from 'react'
import type { ComponentType } from 'react'

export type ViewToggleOption<T extends string> = {
  id: T
  label: string
  icon?: ComponentType<{ className?: string }>
}

type ViewToggleProps<T extends string> = {
  value: T
  onChange: (id: T) => void
  options: ViewToggleOption<T>[]
  /** Accessible label for the control group */
  'aria-label'?: string
}

/**
 * Segmented control for create vs list (or similar) — clear affordance, large tap targets.
 */
export function ViewToggle<T extends string>({
  value,
  onChange,
  options,
  'aria-label': ariaLabel = 'View mode',
}: ViewToggleProps<T>): React.JSX.Element {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex rounded-xl border border-neutral-600 bg-neutral-900/60 p-1 shadow-inner"
    >
      {options.map((opt) => {
        const selected = value === opt.id
        const Icon = opt.icon
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${
              selected
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
