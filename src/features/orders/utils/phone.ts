/**
 * Utility functions for normalizing and matching Pakistani mobile numbers
 */

/**
 * Normalizes any Pakistani mobile number representation to standard 11-digit format: 03XX...
 * Handles inputs like +92300-1234567, 923001234567, 0300 1234567, 0300-1234567, etc.
 */
export function normalizePakistaniPhone(phone: string): string {
  if (!phone) {
    return '';
  }

  // Strip whitespace, hyphens, parens, periods, and leading '+'
  let cleaned = phone.replace(/[\s().-]+/g, '').replace(/^\+/, '');

  if (cleaned.startsWith('00923') && cleaned.length === 14) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('923') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

/**
 * Compares two Pakistani mobile numbers by normalizing both to 03001234567 standard format
 */
export function matchesPakistaniPhone(inputPhone: string, storedPhone: string): boolean {
  const norm1 = normalizePakistaniPhone(inputPhone);
  const norm2 = normalizePakistaniPhone(storedPhone);

  if (!norm1 || !norm2) {
    return false;
  }

  return norm1 === norm2;
}

/**
 * Formats a normalized 11-digit Pakistani phone number as 03XX-XXXXXXX for display
 */
export function formatPakistaniPhoneDisplay(phone: string): string {
  const norm = normalizePakistaniPhone(phone);
  if (norm.length === 11 && norm.startsWith('03')) {
    return `${norm.substring(0, 4)}-${norm.substring(4)}`;
  }
  return phone;
}
