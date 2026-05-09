export type UpdateType = 'announcement' | 'advisory' | 'activity';

export type UpdateSeverity = 'info' | 'warning' | 'urgent';

export interface Update {
  items: boolean;
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
    id: 'adv-012',
    type: 'advisory',
    title: 'Special Non-Working Day',
    description:
      'Monday, 11 May 2026, is declared as a Special (Non-working) Day in the Municipality of Aparri, Province of Cagayan',
    date: '2026-05-11',
    time: '',
    venue: 'Aparri',
    tags: ['Advisories', 'Aramang Festival', 'WalangPasok'],
    source: 'Official Gazette of the Republic of the Philippines',
    link: 'https://www.officialgazette.gov.ph/2026/04/21/proclamation-no-1231-s-2026/',
    isPinned: true,
    status: 'published',
    createdAt: '2026-05-09',
    items: false,
  },
  {
    id: 'act-011',
    type: 'activity',
    title: 'Motorshow',
    description: '',
    date: '2026-05-09',
    time: '07:00 PM',
    venue: 'Aparri Public Park',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
    items: false,
  },
  {
    id: 'act-010',
    type: 'activity',
    title: 'Zumba',
    description: '',
    date: '2026-05-09',
    time: '04:00 PM',
    venue: 'Aparri Public Park',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
    items: false,
  },
  {
    id: 'act-009',
    type: 'activity',
    title: 'Motorcycle Fun Ride (Registration)',
    description: '',
    date: '2026-05-09',
    time: '03:00 PM',
    venue: '',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-08',
    items: false,
  },
  {
    id: 'act-008',
    type: 'activity',
    title: 'Mass Wedding',
    description: '',
    date: '2026-05-09',
    time: '10:00 AM',
    venue: 'St. Peter Thelmo Parish Church',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-08',
    items: false,
  },
  {
    id: 'act-007',
    type: 'activity',
    title: 'Drum and Lyre Presentation',
    description: '',
    date: '2026-05-09',
    time: '08:00 AM',
    venue: 'BDO Aparri',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-08',
    items: false,
  },
  {
    id: 'act-006',
    type: 'activity',
    title: 'Parade around the Town',
    description: '',
    date: '2026-05-09',
    time: '07:00 AM',
    venue: '',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-08',
    items: false,
  },
  {
    id: 'act-005',
    type: 'activity',
    title: 'Retrita',
    description: '',
    date: '2026-05-09',
    time: '04:00 AM',
    venue: '',
    tags: ['Activities', 'Aramang Festival'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/1BH1mnzTNo/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-08',
    items: false,
  },

  {
    id: 'act-002',
    type: 'activity',
    title: 'Application for National ID',
    description: '',
    date: '2026-05-07',
    time: '08:00 AM',
    venue: 'Aparri Municipal Hall',
    tags: ['Activities', 'National ID', 'Services'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/18QZjr2r4L/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
    items: false,
  },
  {
    id: 'act-003',
    type: 'activity',
    title: 'Application for National ID',
    description: '',
    date: '2026-05-06',
    time: '08:00 AM',
    venue: 'Aparri Municipal Hall',
    tags: ['Activities', 'National ID', 'Services'],
    source: 'Mayor Dominador Ambo Dayag Facebook Page',
    link: 'https://www.facebook.com/share/p/18QZjr2r4L/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
    items: false,
  },
  {
    id: 'act-004',
    type: 'activity',
    title: 'Job Fair',
    description: '',
    date: '2026-05-01',
    time: '08:00 AM',
    venue: 'Aparri Public Gymnasium',
    tags: ['Activities', 'Services', 'Government', 'Employment'],
    source: 'PESO Aparri',
    link: 'https://www.facebook.com/share/p/18TM9Xr694/',
    isPinned: false,
    status: 'published',
    createdAt: '2026-05-07',
    items: false,
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
    status: 'archived',
    createdAt: '2026-05-07',
    items: false,
  },
];

const sortUpdates = (a: Update, b: Update) => {
  if (a.isPinned !== b.isPinned) {
    return a.isPinned ? -1 : 1;
  }

  return new Date(b.date).getTime() - new Date(a.date).getTime();
};

export const publishedUpdates = updates
  .filter(update => update.status === 'published')
  .sort(sortUpdates);

export const archivedUpdates = updates
  .filter(update => update.status === 'archived')
  .sort(sortUpdates);
