/**
 * Date formatting and parsing utilities for dd/mm/yyyy format
 */

/**
 * Validate if a string is in dd/mm/yyyy format and represents a valid date
 * @param input - User input string
 * @returns true if valid dd/mm/yyyy format and valid date
 */
export function isValidDateString(input: string): boolean {
  if (!input || typeof input !== 'string') return false

  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = input.match(ddmmyyyyRegex)

  if (!match) return false

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const year = parseInt(match[3], 10)

  // Validate month
  if (month < 1 || month > 12) return false

  // Validate day based on month
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  // Check for leap year
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  if (isLeapYear) daysInMonth[1] = 29

  if (day < 1 || day > daysInMonth[month - 1]) return false

  return true
}

/**
 * Parse dd/mm/yyyy format string to ISO 8601 format (YYYY-MM-DD)
 * @param userInput - User input in dd/mm/yyyy format
 * @returns ISO 8601 date string (YYYY-MM-DD) or null if invalid
 */
export function parseFromInput(userInput: string): string | null {
  if (!isValidDateString(userInput)) return null

  const [day, month, year] = userInput.split('/').map(Number)
  const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  return isoDate
}

/**
 * Convert ISO 8601 date string to dd/mm/yyyy format
 * @param isoDate - ISO 8601 date string (YYYY-MM-DD or full ISO with time)
 * @returns dd/mm/yyyy formatted string
 */
export function formatToDisplay(isoDate: string): string {
  if (!isoDate) return ''

  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ''

    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
  } catch {
    return ''
  }
}

/**
 * Get error message for invalid date input
 * @param input - User input
 * @returns Error message or empty string if valid
 */
export function getDateErrorMessage(input: string): string {
  if (!input) return ''

  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  if (!input.match(ddmmyyyyRegex)) {
    return 'Invalid format. Use dd/mm/yyyy'
  }

  if (!isValidDateString(input)) {
    const [, month] = input.split('/').map(Number)
    if (month < 1 || month > 12) {
      return 'Month must be between 01 and 12'
    }
    return `Invalid day for month ${month}`
  }

  return ''
}
