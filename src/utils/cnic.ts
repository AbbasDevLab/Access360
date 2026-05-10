/** Pakistani CNIC is 13 digits, usually displayed #####-#######-# */
export const CNIC_MAX_DIGITS = 13

/** Formatted value is at most 13 digits + 2 dashes. */
export const CNIC_MAX_INPUT_LENGTH = 15

/**
 * Keep only digits, cap at 13, insert standard dashes while typing.
 */
export function formatPakCnicInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, CNIC_MAX_DIGITS)
  if (digits.length <= 5) return digits
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
}
