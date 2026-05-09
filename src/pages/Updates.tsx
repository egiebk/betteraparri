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

type UpdateFilter = 'all' | Update['type'];

const updateFilters: Array<{
  label: string;
  value: UpdateFilter;
}> = [
  { label: 'All', value: 'all' },
  { label: 'Announcements', value: 'announcement' },
  { label: 'Advisories', value: 'advisory' },
  { label: 'Activities', value: 'activity' },
];

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

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getUpdateTiming(date: string) {
  const todayKey = getDateKey(new Date());
  const updateKey = getDateKey(new Date(`${date}T00:00:00+08:00`));

  if (updateKey === todayKey) {
    return {
      label: 'Today',
      className: 'bg-primary-100 text-primary-700',
    };
  }

  if (updateKey > todayKey) {
    return {
      label: 'Upcoming',
      className: 'bg-violet-50 text-violet-700',
    };
  }

  return {
    label: 'Past event',
    className: 'bg-gray-100 text-gray-600',
  };
}

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(update: Update, searchTerm: string) {
  if (!searchTerm) {
    return true;
  }

  const searchableValues = [
    update.title,
    update.description,
    update.venue,
    update.source,
    ...(update.tags ?? []),
  ];

  return searchableValues.some(
    value => value && normalizeSearchValue(value).includes(searchTerm)
  );
}

function UpdateCard({ update }: { update: Update }) {
  const timing = getUpdateTiming(update.date);

  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {update.isPinned && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800">
              <i className="ri-pushpin-2-line mr-1" aria-hidden="true" />
              Pinned
            </span>
          )}

          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
            {typeLabel[update.type]}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${timing.className}`}
          >
            {timing.label}
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
          <div className="mt-4 border-t border-gray-100 pt-4 text-sm">
            {update.source && (
              <p className="mb-3 text-gray-500">Source: {update.source}</p>
            )}
            {update.link && (
              <a
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-primary-200 bg-white px-3 py-2 font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
                aria-label={`Open source for ${update.title}`}
              >
                View source
                <i className="ri-external-link-line" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const Updates = () => {
  const [showArchives, setShowArchives] = useState(false);
  const [selectedType, setSelectedType] = useState<UpdateFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const searchTerm = normalizeSearchValue(searchQuery);
  const typeFilteredPublishedUpdates =
    selectedType === 'all'
      ? publishedUpdates
      : publishedUpdates.filter(update => update.type === selectedType);
  const typeFilteredArchivedUpdates =
    selectedType === 'all'
      ? archivedUpdates
      : archivedUpdates.filter(update => update.type === selectedType);

  const filteredPublishedUpdates = typeFilteredPublishedUpdates.filter(update =>
    matchesSearch(update, searchTerm)
  );

  const filteredArchivedUpdates = typeFilteredArchivedUpdates.filter(update =>
    matchesSearch(update, searchTerm)
  );

  const getFilterCount = (filter: UpdateFilter) => {
    if (filter === 'all') {
      return publishedUpdates.length;
    }

    return publishedUpdates.filter(update => update.type === filter).length;
  };

  const selectedFilterLabel =
    selectedType === 'all' ? 'updates' : `${typeLabel[selectedType]} updates`;
  const archiveLabel =
    selectedType === 'all'
      ? 'Archived updates'
      : `Archived ${typeLabel[selectedType]} updates`;

  const handleTypeChange = (filter: UpdateFilter) => {
    setSelectedType(filter);
    setShowArchives(false);
  };

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

        <div className="mb-4 max-w-xl">
          <label
            htmlFor="updates-search"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Search updates
          </label>
          <div className="relative">
            <i
              className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              id="updates-search"
              type="search"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              placeholder="Search by title, venue, tag, or source"
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>

        <div
          aria-label="Filter updates by type"
          className="mb-6 flex gap-2 overflow-x-auto rounded-full border border-gray-200 bg-white p-1"
        >
          {updateFilters.map(filter => {
            const isSelected = selectedType === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleTypeChange(filter.value)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {filter.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {getFilterCount(filter.value)}
                </span>
              </button>
            );
          })}
        </div>

        {filteredPublishedUpdates.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPublishedUpdates.map(update => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-gray-200 bg-white p-6">
            <Text className="mb-0 text-gray-600">
              No current {selectedFilterLabel} match your filters.
            </Text>
          </div>
        )}

        {filteredArchivedUpdates.length > 0 && (
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
              {showArchives ? 'Hide' : 'View'} {archiveLabel} (
              {filteredArchivedUpdates.length})
            </button>

            {showArchives && (
              <div
                id="archived-updates"
                className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              >
                {filteredArchivedUpdates.map(update => (
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
