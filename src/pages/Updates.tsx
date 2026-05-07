import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { publishedUpdates } from '../data/updates';

const Updates = () => {
  return (
    <>
      <SEO
        title="Updates"
        description="Latest announcements and public advisories from BetterAparri."
      />

      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />

        <Heading className="mb-2">
          <i className="ri-notification-line mr-2 text-primary-600" />
          Updates
        </Heading>

        <Text className="text-gray-600 mb-6">
          Stay informed with the latest announcements and public advisories.
        </Text>

        <div className="space-y-6">
          {publishedUpdates.map(update => (
            <div
              key={update.id}
              className="border rounded-xl p-5 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {update.type}
                </span>

                {update.severity && (
                  <span className="text-xs uppercase font-semibold px-2 py-1 rounded bg-red-100 text-red-700">
                    {update.severity}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-semibold">{update.title}</h2>

              <p className="text-sm text-gray-500 mt-1">
                {update.date}
                {update.time ? ` • ${update.time}` : ''}
                {update.venue ? ` • ${update.venue}` : ''}
              </p>

              {update.description && (
                <p className="mt-3 text-gray-700">{update.description}</p>
              )}

              {update.tags && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {update.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {update.source && (
                <p className="mt-4 text-sm text-gray-500">
                  Source: {update.source}{' '}
                  {update.link && (
                    <a
                      href={update.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      <i className="ri-external-link-line mr-1" />
                    </a>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

export default Updates;
