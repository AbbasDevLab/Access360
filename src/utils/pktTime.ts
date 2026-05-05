/** Pakistan Standard Time (no DST). */
export const PKT_TIMEZONE = 'Asia/Karachi'

/**
 * Parse API timestamps. Many .NET/SQL pipelines return UTC wall time **without** a `Z`
 * (e.g. `2026-05-04T20:46:00`). ECMAScript treats that as **local** time, which shifts
 * PKT display by ~5h. Naive `YYYY-MM-DDTHH:mm:ss(.fff)?` strings are interpreted as **UTC**
 * by appending `Z`. If your backend truly sends Pakistan local clock without an offset,
 * change the server to send `+05:00` or use `DateTime` with offset in JSON.
 */
export function parseAccess360ApiInstant(raw: string | Date | null | undefined): Date | null {
  if (raw == null || raw === '') return null
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw

  const s = String(raw).trim()
  if (!s) return null

  const dotnet = /^\/Date\((-?\d+)([+-]\d{4})?\)\/$/.exec(s)
  if (dotnet) {
    const ms = parseInt(dotnet[1], 10)
    return Number.isFinite(ms) ? new Date(ms) : null
  }

  // Date-only → UTC midnight (matches ES date-only parsing)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`)
    return Number.isNaN(d.getTime()) ? null : d
  }

  let iso = s.replace(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, '$1T$2')

  const hasTimeZone =
    /[zZ]$/.test(iso) || /[+-]\d{2}:\d{2}$/.test(iso) || /[+-]\d{4}$/.test(iso)
  if (/^\d{4}-\d{2}-\d{2}T/.test(iso) && !hasTimeZone) {
    iso = `${iso}Z`
  }

  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

const timeOnly: Intl.DateTimeFormatOptions = {
  timeZone: PKT_TIMEZONE,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
}

const dateTime: Intl.DateTimeFormatOptions = {
  timeZone: PKT_TIMEZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
}

function safeDate(iso: string | null | undefined): Date | null {
  return parseAccess360ApiInstant(iso)
}

/** `YYYY-MM-DD` in PKT for a given instant (for filters and "today"). */
export function toPktYmd(input: string | Date): string {
  const d = typeof input === 'string' ? safeDate(input) : input
  if (!d || Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-CA', { timeZone: PKT_TIMEZONE })
}

/** Today’s calendar date in PKT as `YYYY-MM-DD` (for defaulting date inputs). */
export function getPktTodayYmd(): string {
  return toPktYmd(new Date())
}

export function formatPktTime(iso: string | null | undefined): string {
  const d = safeDate(iso)
  if (!d) return 'N/A'
  return d.toLocaleTimeString('en-PK', timeOnly)
}

export function formatPktDateTime(iso: string | null | undefined): string {
  const d = safeDate(iso)
  if (!d) return 'N/A'
  return d.toLocaleString('en-PK', dateTime)
}

/** Same calendar day in PKT as `ref` (default: now). */
export function isPktCalendarDay(timeIso: string, ref: Date = new Date()): boolean {
  return toPktYmd(timeIso) === toPktYmd(ref)
}

/** `YYYY-MM` in PKT for month bucketing. */
export function toPktYearMonth(input: string | Date): string {
  return toPktYmd(input).slice(0, 7)
}

export function isSamePktMonth(timeIso: string, ref: Date = new Date()): boolean {
  return toPktYearMonth(timeIso) === toPktYearMonth(ref)
}

/** Wall-clock hour 0–23 in PKT (for peak-hour charts). */
export function getPktHour24(iso: string | null | undefined): number | undefined {
  const d = safeDate(iso)
  if (!d) return undefined
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PKT_TIMEZONE,
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(d)
  const h = parts.find((p) => p.type === 'hour')?.value
  if (h === undefined) return undefined
  return parseInt(h, 10)
}
