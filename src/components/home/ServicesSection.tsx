import { Link } from 'react-router-dom';
import Section from '../ui/Section';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import GuideCard from '../services/GuideCard';
import { cn } from '../../lib/utils';
import { lifeEvents, serviceGuides } from '../../data/serviceGuides';

/**
 * Homepage services block: life-event shortcuts into /services, plus the
 * plain-language step-by-step guides.
 */
export default function ServicesSection() {
  return (
    <Section className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Heading level={2}>Services</Heading>
          <Text className="text-gray-600">
            Know what to bring, where to go and how much it costs before you
            visit the Municipal Hall.
          </Text>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          View all services
          <i aria-hidden="true" className="ri-arrow-right-line ml-1" />
        </Link>
      </div>

      <h3 className="mb-3 text-lg font-semibold text-gray-900">
        What do you need to do?
      </h3>
      <ul className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lifeEvents.map(event => {
          const guideCount = event.items.filter(item => item.guide).length;
          return (
            <li key={event.slug}>
              <Link
                to={`/services#${event.slug}`}
                className="card-fade-in group flex h-full items-center gap-3 rounded-lg border border-primary-100 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:bg-blue-50"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
                >
                  <i className={cn(event.icon, 'text-lg')} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-gray-900 group-hover:text-primary-700">
                    {event.title}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {event.items.length}{' '}
                    {event.items.length === 1 ? 'service' : 'services'}
                    {guideCount > 0 &&
                      ` · ${guideCount} ${guideCount === 1 ? 'guide' : 'guides'}`}
                  </span>
                </span>
                <i
                  aria-hidden="true"
                  className="ri-arrow-right-s-line text-lg text-gray-400 group-hover:text-primary-600"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      {serviceGuides.length > 0 && (
        <>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Step-by-step guides
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceGuides.map(guide => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
