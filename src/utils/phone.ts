/** Pakistani mobile local format: 03XXXXXXXXX (11 digits). */
export const PAK_MOBILE_LOCAL_DIGITS = 11

/** Max input length with optional separators (e.g. 0300-1234567). */
export const PAK_MOBILE_MAX_INPUT_LENGTH = 14

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/**
 * Normalize typed digits toward local 03… form (11 digits).
 * Accepts 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX.
 */
export function normalizePakMobileDigits(raw: string): string {
  let d = digitsOnly(raw)
  if (d.startsWith('92') && d.length >= 12) {
    d = `0${d.slice(2)}`
  }
  if (d.length === 10 && d.startsWith('3')) {
    d = `0${d}`
  }
  return d.slice(0, PAK_MOBILE_LOCAL_DIGITS)
}

/** True when normalized value is exactly 11 digits starting with 03. */
export function isValidPakMobile(raw: string): boolean {
  const d = normalizePakMobileDigits(raw)
  return d.length === PAK_MOBILE_LOCAL_DIGITS && d.startsWith('03')
}

/**
 * Strip non-digits, normalize prefix, cap at 11; optional dashes after first 4 digits.
 */
export function formatPakMobileInput(raw: string): string {
  const d = normalizePakMobileDigits(raw)
  if (d.length <= 4) return d
  return `${d.slice(0, 4)}-${d.slice(4)}`
}
