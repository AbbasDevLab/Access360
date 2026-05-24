/**
 * Normalizes typical ASP.NET / legacy JSON shapes for this app:
 * - Optional wrapper objects: { data }, { value }, { guestVisits }, etc.
 * - PascalCase property names → camelCase (recursive)
 */

const LIST_KEYS = [
  'data',
  'Data',
  'value',
  'Value',
  'items',
  'Items',
  'result',
  'Result',
  'results',
  'Results',
  'guestVisits',
  'GuestVisits',
  'guests',
  'Guests',
  'categories',
  'Categories',
  'visitorTypes',
  'VisitorTypes',
  'locations',
  'Locations',
  'departments',
  'Departments',
]

const EXPLICIT_KEY_MAP: Record<string, string> = {
  Idpk: 'idpk',
  IDPK: 'idpk',
  CNICNumber: 'cnicNumber',
  RFIDCardNumber: 'rfidCardNumber',
  DOB: 'dob',
}

function toCamelPropertyName(key: string): string {
  if (Object.prototype.hasOwnProperty.call(EXPLICIT_KEY_MAP, key)) {
    return EXPLICIT_KEY_MAP[key]
  }
  if (/^[a-z]/.test(key)) {
    return key
  }
  if (/^[A-Z]/.test(key)) {
    return key.charAt(0).toLowerCase() + key.slice(1)
  }
  return key
}

export function normalizeDeep<T = unknown>(value: unknown): T {
  if (value === null || typeof value !== 'object') {
    return value as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDeep(item)) as T
  }
  const src = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(src)) {
    const nk = toCamelPropertyName(k)
    out[nk] = normalizeDeep(v)
  }
  return out as T
}

export function unwrapArray(json: unknown): unknown[] {
  if (Array.isArray(json)) {
    return json
  }
  if (json && typeof json === 'object') {
    const o = json as Record<string, unknown>
    for (const key of LIST_KEYS) {
      const v = o[key]
      if (Array.isArray(v)) {
        return v
      }
    }
  }
  return []
}

export function normalizeArray<T>(json: unknown): T[] {
  return unwrapArray(json).map((row) => normalizeDeep<T>(row))
}

export function normalizeObject<T>(json: unknown): T {
  return normalizeDeep<T>(json)
}
