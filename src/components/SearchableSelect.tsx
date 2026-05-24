import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export interface SearchableSelectOption {
  value: string
  label: string
}

export interface SearchableSelectProps {
  id: string
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  required?: boolean
  disabled?: boolean
  placeholder?: string
  emptyListMessage?: string
  labelClassName?: string
  inputClassName?: string
  filterHint?: string
  allowCustomValue?: boolean
  customCommittedText?: string
  onCustomCommitted?: (text: string) => void
}

const LIST_MAX_PX = 208
const LIST_GAP = 4
const LIST_Z = 2147483646
const ROOT_ATTR = 'data-searchable-select-root'
const LIST_ATTR = 'data-searchable-select-list'

type ListRow =
  | { kind: 'clear' }
  | { kind: 'custom'; text: string }
  | { kind: 'option'; value: string; label: string }

function eventTargetsInstance(e: Event, instanceId: string): boolean {
  const path = typeof e.composedPath === 'function' ? e.composedPath() : []
  for (const n of path) {
    if (!(n instanceof Element)) continue
    if (n.getAttribute(ROOT_ATTR) === instanceId || n.getAttribute(LIST_ATTR) === instanceId) return true
  }
  return false
}

export default function SearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = 'Type to search…',
  emptyListMessage = 'No matches',
  labelClassName = 'text-sm font-medium text-neutral-700',
  inputClassName = 'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-inner placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#00A651]/25 focus:border-[#00A651] disabled:bg-neutral-100 disabled:cursor-not-allowed',
  filterHint = 'Filter options',
  allowCustomValue = false,
  customCommittedText = '',
  onCustomCommitted,
}: SearchableSelectProps): React.JSX.Element {
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryRef = useRef('')
  const openRef = useRef(false)
  const suppressOutsideRef = useRef(false)
  /** Shown when closed until parent props catch up after a pick. */
  const closedLabelRef = useRef('')

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(-1)
  const [listStyle, setListStyle] = useState<React.CSSProperties>({})

  openRef.current = open

  const resolvedLabelClass =
    labelClassName != null && labelClassName.trim() !== ''
      ? labelClassName
      : 'text-sm font-medium text-neutral-700'

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const showClear = !required && value !== ''
  const useCustomRow =
    allowCustomValue &&
    Boolean(onCustomCommitted) &&
    query.trim().length > 0 &&
    !options.some((o) => o.label.toLowerCase() === query.trim().toLowerCase())

  const rows: ListRow[] = useMemo(() => {
    const list: ListRow[] = []
    if (showClear) list.push({ kind: 'clear' })
    if (useCustomRow) list.push({ kind: 'custom', text: query.trim() })
    for (const o of filtered) list.push({ kind: 'option', value: o.value, label: o.label })
    return list
  }, [showClear, useCustomRow, query, filtered])

  useEffect(() => {
    queryRef.current = query
  }, [query])

  useEffect(() => {
    if (!open) setHighlight(-1)
    else if (rows.length > 0) setHighlight(0)
  }, [open, rows.length])

  const repositionList = useCallback(() => {
    const el = anchorRef.current
    if (!el || !openRef.current) return
    const r = el.getBoundingClientRect()
    const maxH = Math.min(LIST_MAX_PX, Math.max(120, window.innerHeight - r.bottom - LIST_GAP - 12))
    setListStyle({
      position: 'fixed',
      top: r.bottom + LIST_GAP,
      left: r.left,
      width: r.width,
      maxHeight: maxH,
      zIndex: LIST_Z,
    })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    repositionList()
    const el = anchorRef.current
    if (!el) return
    const ro = new ResizeObserver(() => repositionList())
    ro.observe(el)
    window.addEventListener('scroll', repositionList, true)
    window.addEventListener('resize', repositionList)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', repositionList, true)
      window.removeEventListener('resize', repositionList)
    }
  }, [open, repositionList, query, rows.length])

  const syncQueryFromValue = useCallback(() => {
    if (customCommittedText) {
      closedLabelRef.current = customCommittedText
      setQuery(customCommittedText)
      return
    }
    const label = selected?.label ?? ''
    closedLabelRef.current = label
    setQuery(label)
  }, [customCommittedText, selected?.label])

  const selectOption = useCallback(
    (nextValue: string, nextLabel: string) => {
      suppressOutsideRef.current = true
      closedLabelRef.current = nextLabel
      setQuery(nextLabel)
      setOpen(false)
      setHighlight(-1)
      onChange(nextValue)
      onCustomCommitted?.('')
      requestAnimationFrame(() => {
        suppressOutsideRef.current = false
      })
    },
    [onChange, onCustomCommitted],
  )

  const selectCustom = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || !onCustomCommitted) return
      suppressOutsideRef.current = true
      closedLabelRef.current = trimmed
      setQuery(trimmed)
      setOpen(false)
      setHighlight(-1)
      // Parent clears list id inside onCustomCommitted — do not call onChange('') here (race with parent state).
      onCustomCommitted(trimmed)
      requestAnimationFrame(() => {
        suppressOutsideRef.current = false
      })
    },
    [onCustomCommitted],
  )

  const activateRow = useCallback(
    (row: ListRow) => {
      if (row.kind === 'clear') selectOption('', '')
      else if (row.kind === 'custom') selectCustom(row.text)
      else selectOption(row.value, row.label)
    },
    [selectCustom, selectOption],
  )

  const commitQueryOrRevert = useCallback(() => {
    const q = queryRef.current.trim()
    if (!q) {
      if (customCommittedText || value) {
        onChange('')
        onCustomCommitted?.('')
      }
      setQuery('')
      return
    }
    const exact = options.find((o) => o.label.toLowerCase() === q.toLowerCase())
    if (exact) {
      selectOption(exact.value, exact.label)
      return
    }
    if (allowCustomValue && onCustomCommitted) {
      selectCustom(q)
      return
    }
    if (value && selected) {
      syncQueryFromValue()
      return
    }
    syncQueryFromValue()
  }, [
    allowCustomValue,
    customCommittedText,
    onChange,
    onCustomCommitted,
    options,
    selectCustom,
    selectOption,
    selected,
    syncQueryFromValue,
    value,
  ])

  /** Same event type as option handlers: mousedown (bubble), after target handlers run. */
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (suppressOutsideRef.current) return
      if (!openRef.current) return
      if (eventTargetsInstance(e, id)) return
      commitQueryOrRevert()
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown, false)
    return () => document.removeEventListener('mousedown', onDocMouseDown, false)
  }, [commitQueryOrRevert, id])

  useEffect(() => {
    closedLabelRef.current = customCommittedText || selected?.label || ''
  }, [customCommittedText, selected?.label])

  useEffect(() => {
    if (openRef.current) return
    syncQueryFromValue()
  }, [value, customCommittedText, syncQueryFromValue])

  const closedDisplay = customCommittedText || selected?.label || closedLabelRef.current || ''

  const openList = () => {
    setOpen(true)
    if (customCommittedText) setQuery(customCommittedText)
    else setQuery(selected?.label ?? '')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      syncQueryFromValue()
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      if (rows.length === 0) return
      setHighlight((h) => (h < rows.length - 1 ? h + 1 : 0))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      if (rows.length === 0) return
      setHighlight((h) => (h > 0 ? h - 1 : rows.length - 1))
      return
    }

    if (e.key === 'Enter') {
      if (!open) return
      e.preventDefault()
      if (highlight >= 0 && highlight < rows.length) {
        activateRow(rows[highlight])
        return
      }
      commitQueryOrRevert()
      setOpen(false)
    }
  }

  const handleRowMouseDown = (e: React.MouseEvent, row: ListRow) => {
    e.preventDefault()
    e.stopPropagation()
    activateRow(row)
    inputRef.current?.focus()
  }

  const portalList =
    open &&
    !disabled &&
    typeof document !== 'undefined' &&
    createPortal(
      <ul
        id={`${id}-listbox`}
        role="listbox"
        {...{ [LIST_ATTR]: id }}
        style={listStyle}
        className="max-h-52 overflow-auto rounded-lg border border-neutral-200 bg-white py-1 shadow-lg ring-1 ring-black/10"
      >
        {rows.length === 0 ? (
          <li className="px-3 py-2 text-sm text-neutral-500">{emptyListMessage}</li>
        ) : (
          rows.map((row, index) => {
            const isActive = index === highlight
            if (row.kind === 'clear') {
              return (
                <li key="clear" role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === ''}
                    className={`w-full px-3 py-2 text-left text-sm text-neutral-500 ${isActive ? 'bg-neutral-100' : 'hover:bg-neutral-50'}`}
                    onMouseDown={(e) => handleRowMouseDown(e, row)}
                  >
                    Clear selection
                  </button>
                </li>
              )
            }
            if (row.kind === 'custom') {
              return (
                <li key="custom" role="presentation">
                  <button
                    type="button"
                    role="option"
                    className={`w-full px-3 py-2 text-left text-sm font-medium text-[#007a3d] ${isActive ? 'bg-green-50' : 'hover:bg-green-50'}`}
                    onMouseDown={(e) => handleRowMouseDown(e, row)}
                  >
                    Use custom: &quot;{row.text}&quot;
                  </button>
                </li>
              )
            }
            return (
              <li key={row.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === row.value}
                  className={`w-full px-3 py-2 text-left text-sm ${
                    isActive
                      ? 'bg-green-50 font-medium text-[#007a3d]'
                      : value === row.value
                        ? 'bg-green-50/60 font-medium text-[#007a3d]'
                        : 'text-neutral-900 hover:bg-neutral-50'
                  }`}
                  onMouseDown={(e) => handleRowMouseDown(e, row)}
                >
                  {row.label}
                </button>
              </li>
            )
          })
        )}
      </ul>,
      document.body,
    )

  return (
    <div className="grid gap-2" {...{ [ROOT_ATTR]: id }}>
      <label htmlFor={`${id}-search`} className={resolvedLabelClass}>
        {label}
      </label>
      <div className="relative">
        <div className="relative" ref={anchorRef}>
          <input
            ref={inputRef}
            id={`${id}-search`}
            type="text"
            name={`${id}-search`}
            autoComplete="off"
            disabled={disabled}
            placeholder={placeholder}
            aria-expanded={open}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
            aria-activedescendant={
              open && highlight >= 0 && rows[highlight]?.kind === 'option'
                ? `${id}-opt-${rows[highlight].value}`
                : undefined
            }
            title={filterHint}
            value={open ? query : closedDisplay}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
              setHighlight(0)
            }}
            onFocus={openList}
            onKeyDown={handleInputKeyDown}
            className={inputClassName}
          />
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (disabled) return
              if (open) {
                setOpen(false)
                syncQueryFromValue()
              } else {
                openList()
                inputRef.current?.focus()
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40"
            aria-label="Toggle list"
          >
            <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {required ? (
          <input
            type="hidden"
            name={id}
            value={value || customCommittedText || ''}
            required
            readOnly
            aria-hidden
          />
        ) : null}
      </div>
      {portalList}
    </div>
  )
}
