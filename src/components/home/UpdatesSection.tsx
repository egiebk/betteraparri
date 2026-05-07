import { Link } from 'react-router-dom';
import Section from '../ui/Section';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { publishedUpdates } from '../../data/updates';
import type { Update } from '../../data/updates';

const typeLabel: Record<Update['type'], string> = {
  announcement: 'Announcement',
  advisory: 'Public Advisory',
  activity: 'Activity',
};

const severityClasses: Record<NonNullable<Update['severity']>, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export default function UpdatesSection() {
  const latestUpdates = publishedUpdates.slice(0, 3);

  if (latestUpdates.length === 0) {
    return null;
  }

  return (
    <Section className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading level={2}>Updates</Heading>
          <Text className="text-gray-600">
            Stay informed with the latest announcements and public advisories.
          </Text>
        </div>

        <Link
          to="/updates"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all updates
          <i className="ri-arrow-right-line ml-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {latestUpdates.map(update => (
          <Card
            key={update.id}
            hoverable
            className="border-primary-100 hover:bg-blue-50"
          >
            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                  {typeLabel[update.type]}
                </span>

                {update.severity && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      severityClasses[update.severity]
                    }`}
                  >
                    {update.severity}
                  </span>
                )}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {update.title}
              </h3>

              <div className="mb-3 space-y-1 text-sm text-gray-600">
                <p>
                  <i className="ri-calendar-line mr-1" />
                  {formatDate(update.date)}
                  {update.time ? ` • ${update.time}` : ''}
                </p>

                {update.venue && (
                  <p>
                    <i className="ri-map-pin-line mr-1" />
                    {update.venue}
                  </p>
                )}
              </div>

              {update.description && (
                <Text className="mb-4 line-clamp-3 text-sm text-gray-700">
                  {update.description}
                </Text>
              )}

              {update.tags && update.tags.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  {update.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
