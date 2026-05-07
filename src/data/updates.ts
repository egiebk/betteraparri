export type UpdateType = 'announcement' | 'advisory' | 'activity';

export type UpdateSeverity = 'info' | 'warning' | 'urgent';

export interface Update {
  id: string;
  type: UpdateType;
  title: string;
  description?: string;
  date: string;
  time?: string;
  venue?: string;
  tags?: string[];
  source?: string;
  link?: string;
  severity?: UpdateSeverity;
  imageUrl?: string;
  isPinned?: boolean;
  status: 'draft' | 'published' | 'archived';
  expiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const updates: Update[] = [
  {
    id: 'act-001',
    type: 'activity',
    title: 'MOTORCYCLE FUN RIDE',
    description:
      "Join us for a fun-filled motorcycle ride around the town! All motorcycle enthusiasts are welcome to participate. Don't miss out on this exciting event! Pre-Rider Inspection is required for all participants.",
    date: '2026-05-10',
    time: '06:00 AM',
    venue: 'Aparri Municipal Hall',
    tags: ['Events', 'Community', 'Motorcycle', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook',
    link: 'https://www.facebook.com/share/p/1E2EYNJQYv/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'act-002',
    type: 'activity',
    title: 'APPLICATION FOR NATIONAL ID',
    description:
      'The Philippine Statistics Authority (PSA) will conduct a National ID registration drive in Aparri. Residents can apply for their National ID at the designated registration centers. Please bring valid identification documents for the application process.',
    date: '2026-05-07',
    time: '06:00 AM',
    venue: 'Aparri Municipal Hall',
    tags: ['Activities', 'National ID', 'Services'],
    source: 'Mayor Dominador Ambo Dayag Facebook',
    link: 'https://www.facebook.com/share/p/18QZjr2r4L/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'act-003',
    type: 'activity',
    title: 'APPLICATION FOR NATIONAL ID',
    description:
      'The Philippine Statistics Authority (PSA) will conduct a National ID registration drive in Aparri. Residents can apply for their National ID at the designated registration centers. Please bring valid identification documents for the application process.',
    date: '2026-05-06',
    time: '06:00 AM',
    venue: 'Aparri Municipal Hall',
    tags: ['Activities', 'National ID', 'Services'],
    source: 'Mayor Dominador Ambo Dayag Facebook',
    link: 'https://www.facebook.com/share/p/18QZjr2r4L/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'act-004',
    type: 'activity',
    title: 'JOB FAIR',
    description:
      "All job seekers and interested individuals are invited to attend the Government Service Caravan cum Job Fair organized by the Municipal Government of Aparri. This event will provide an opportunity for job seekers to connect with various government agencies and explore employment opportunities. Don't miss out on this chance to find your next career move!",
    date: '2026-05-01',
    time: '08:00 AM',
    venue: 'Aparri Public Gymnasium',
    tags: ['Activities', 'Services', 'Government', 'Employment'],
    source: 'PESO Aparri',
    link: 'https://www.facebook.com/share/p/18TM9Xr694/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'advisory-001',
    type: 'advisory',
    title: 'Schedule of Public Consultations',
    description:
      '08:00 AM - Revenue Code, 01:00 PM - Comprehensive Land Use Plan.',
    date: '2026-04-29',
    time: '08:00 AM onwards',
    venue: 'Aparri Public Gymnasium',
    tags: ['Advisory', 'Public Consultation', 'Revenue Code', 'Land Use Plan'],
    source: 'Municipal Planning and Development Office - Aparri',
    link: 'https://www.facebook.com/share/p/192c4pa8R4/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
  },
];

export const publishedUpdates = updates
  .filter(update => update.status === 'published')
  .sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
