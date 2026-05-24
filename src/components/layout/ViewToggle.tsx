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
 * Segmented control for create vs list — guard desk styling (white pill, green selection).
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
      className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-inner"
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
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A651]/30 focus-visible:ring-offset-2 ${
              selected
                ? 'bg-[#00A651] text-white shadow-md shadow-[#00A651]/25'
                : 'text-neutral-700 hover:bg-neutral-50'
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
