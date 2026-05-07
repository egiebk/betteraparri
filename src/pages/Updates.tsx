import { useState } from 'react';
import { Card, CardContent } from '@bettergov/kapwa/card';
import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  archivedUpdates,
  publishedUpdates,
  type Update,
} from '../data/updates';

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

function UpdateCard({ update }: { update: Update }) {
  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col p-4">
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

        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {update.title}
        </h2>

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
          <Text className="mb-4 text-gray-700">{update.description}</Text>
        )}

        {update.tags && update.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {update.tags.map(tag => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {(update.source || update.link) && (
          <p className="mt-4 text-sm text-gray-500">
            {update.source && <>Source: {update.source} </>}
            {update.link && (
              <a
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary-600 hover:text-primary-700"
                aria-label={`Open source for ${update.title}`}
              >
                <i className="ri-external-link-line" />
              </a>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

const Updates = () => {
  const [showArchives, setShowArchives] = useState(false);

  return (
    <>
      <SEO
        title="Updates"
        description="Latest announcements and public advisories from BetterAparri."
      />

      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />

        <Heading className="mb-2 flex items-center gap-3">
          <i className="ri-notification-line text-sm text-primary-600 md:text-5xl" />
          Updates
        </Heading>

        <Text className="mb-6 text-gray-600">
          Stay informed with the latest announcements and public advisories.
        </Text>

        {publishedUpdates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1">
            {publishedUpdates.map(update => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="mb-0 text-gray-600">
              No current updates are available.
            </Text>
          </div>
        )}

        {archivedUpdates.length > 0 && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <button
              type="button"
              aria-expanded={showArchives}
              aria-controls="archived-updates"
              onClick={() => setShowArchives(current => !current)}
              className="inline-flex items-center gap-2 rounded-md border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
            >
              <i
                className={`ri-arrow-${showArchives ? 'up' : 'down'}-s-line text-lg`}
              />
              {showArchives ? 'Hide Archived' : 'View Archived'}
            </button>

            {showArchives && (
              <div
                id="archived-updates"
                className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                {archivedUpdates.map(update => (
                  <UpdateCard key={update.id} update={update} />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
};

export default Updates;
