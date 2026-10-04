/**
 * Hotline directory for Aparri.
 *
 * Single source of truth reused by the homepage's "Emergency Hotlines"
 * strip and the full /hotlines page, so numbers only need to be updated
 * in one place. Barangay hall numbers are read from the barangay pages
 * (content/government/barangays/*.md, "Barangay Telephone" line).
 */
export interface Hotline {
  label: string;
  number: string;
  icon: string;
  description?: string;
}

export interface BarangayHotline {
  name: string;
  slug: string;
  captain?: string;
  number?: string;
}

export const MUNICIPAL_HALL_PHONE = '078-888-2001';

/** Local emergency responders in Aparri. */
export const emergencyHotlines: Hotline[] = [
  {
    label: 'MDRRMO',
    number: '09566542894',
    icon: 'ri-alarm-warning-line',
    description: 'Disaster & risk reduction',
  },
  {
    label: 'Police Station',
    number: '09172302003',
    icon: 'ri-police-badge-line',
    description: 'Police',
  },
  {
    label: 'Fire Station',
    number: '09164910946',
    icon: 'ri-fire-line',
    description: 'Fire protection',
  },
  {
    label: 'Coast Guard',
    number: '09568301802',
    icon: 'ri-ship-2-line',
    description: 'Coast guard',
  },
  {
    label: 'Provincial Hospital',
    number: '09363748430',
    icon: 'ri-hospital-line',
    description: 'Medical emergencies',
  },
];

/** Nationwide hotlines that work from any phone in the Philippines. */
export const nationalHotlines: Hotline[] = [
  {
    label: 'Emergency 911',
    number: '911',
    icon: 'ri-phone-fill',
    description: 'National emergency hotline for police, fire and medical',
  },
  {
    label: 'Philippine Red Cross',
    number: '143',
    icon: 'ri-first-aid-kit-line',
    description: 'Ambulance, rescue and blood services',
  },
  {
    label: 'Citizens’ Complaint Hotline',
    number: '8888',
    icon: 'ri-customer-service-2-line',
    description: 'Report slow or poor government service, or corruption',
  },
];

/** Town hall offices (office hours only). */
export const municipalHotlines: Hotline[] = [
  {
    label: 'Municipal Hall',
    number: MUNICIPAL_HALL_PHONE,
    icon: 'ri-government-line',
    description: 'Mon–Fri, 8:00 AM–5:00 PM',
  },
];

const barangayPages = import.meta.glob(
  '../../content/government/barangays/*.md',
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>;

function parseBarangay(path: string, markdown: string): BarangayHotline {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const name =
    markdown.match(/^#\s+(?:Barangay\s+)?(.+)$/m)?.[1].trim() ?? slug;
  const number = markdown
    .match(/\*\*Barangay Telephone:\*\*\s*([0-9()+\- ]{3,})/)?.[1]
    .trim();
  const captain = markdown
    .match(/##\s+Punong Barangay\s*\n+\s*-\s*(.+)/)?.[1]
    .trim();
  return { name, slug, captain, number: number || undefined };
}

export const barangayHotlines: BarangayHotline[] = Object.entries(barangayPages)
  .map(([path, markdown]) => parseBarangay(path, markdown))
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

/** Formats 09171234567 as 0917 123 4567; other numbers are left as-is. */
export function formatPhone(number: string) {
  const digits = number.replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return number;
}

/** Value for a tel: link (digits and a leading + only). */
export function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
