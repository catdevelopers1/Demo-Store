export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu and Kashmir',
  'Gilgit-Baltistan',
] as const;

export type PakistanProvince = (typeof PAKISTAN_PROVINCES)[number];

export const PAKISTAN_CITIES_BY_PROVINCE: Record<PakistanProvince, readonly string[]> = {
  Punjab: [
    'Lahore',
    'Faisalabad',
    'Rawalpindi',
    'Multan',
    'Gujranwala',
    'Sialkot',
    'Bahawalpur',
    'Sargodha',
    'Sheikhupura',
    'Jhang',
  ],
  Sindh: [
    'Karachi',
    'Hyderabad',
    'Sukkur',
    'Larkana',
    'Nawabshah',
    'Mirpur Khas',
    'Jacobabad',
  ],
  'Khyber Pakhtunkhwa': [
    'Peshawar',
    'Mardan',
    'Abbottabad',
    'Swat',
    'Kohat',
    'Dera Ismail Khan',
    'Mansehra',
  ],
  Balochistan: ['Quetta', 'Gwadar', 'Khuzdar', 'Turbat', 'Sibi', 'Chaman'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Azad Jammu and Kashmir': ['Muzaffarabad', 'Mirpur', 'Rawalakot'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu', 'Hunza'],
};

/**
 * Retrieves all unique Pakistani cities across all provinces sorted alphabetically
 */
export function getAllCities(): string[] {
  const cities = new Set<string>();
  for (const list of Object.values(PAKISTAN_CITIES_BY_PROVINCE)) {
    for (const city of list) {
      cities.add(city);
    }
  }
  return Array.from(cities).sort();
}

/**
 * Validates whether a city exists within the specified Pakistani province
 */
export function isValidPakistanCity(city: string, province?: PakistanProvince): boolean {
  if (province && PAKISTAN_CITIES_BY_PROVINCE[province]) {
    return PAKISTAN_CITIES_BY_PROVINCE[province].includes(city);
  }
  return getAllCities().includes(city);
}

/**
 * Formats a Pakistani mobile number cleanly with a hyphen (e.g. 03001234567 -> 0300-1234567)
 */
export function formatPakistanPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.substring(0, 4)}-${digits.substring(4)}`;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return `+${digits.substring(0, 5)}-${digits.substring(5)}`;
  }
  return phone;
}
