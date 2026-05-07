export type UpdateType = 'announcement' | 'advisory';

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
    id: 'general-announcement-001',
    type: 'announcement',
    title: 'Municipal Clean-Up Drive',
    description:
      'Residents and community organizations are invited to join the municipal clean-up drive in support of a cleaner and safer Aparri.',
    date: '2026-05-15',
    time: '8:00 AM',
    venue: 'Aparri Public Market',
    tags: ['Environment', 'Community', 'Public Service'],
    source: 'Municipal Environment and Natural Resources Office',
    isPinned: true,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'public-advisory-001',
    type: 'advisory',
    title: 'Heavy Rainfall Advisory',
    description:
      'Residents in low-lying and flood-prone areas are advised to monitor official weather updates and prepare for possible flooding.',
    date: '2026-05-07',
    time: '3:00 PM',
    tags: ['Weather', 'DRRM', 'Flood Advisory'],
    source: 'MDRRMO Aparri',
    severity: 'warning',
    isPinned: true,
    status: 'published',
    createdAt: '2026-05-07',
  },
  {
    id: 'general-announcement-002',
    type: 'announcement',
    title: 'Public Consultation Meeting',
    description:
      'The public is encouraged to attend and share feedback on upcoming municipal programs and community priorities.',
    date: '2026-05-20',
    time: '2:00 PM',
    venue: 'Municipal Hall Conference Room',
    tags: ['Consultation', 'Governance'],
    source: 'Office of the Municipal Mayor',
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
