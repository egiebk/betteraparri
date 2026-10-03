import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@bettergov/kapwa/card';
import Section from '../ui/Section';
import Breadcrumbs from '../ui/Breadcrumbs';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import SEO from '../SEO';
import GuideCard from './GuideCard';
import { cn } from '../../lib/utils';
import { serviceCategories } from '../../data/yamlLoader';
import {
  guideSearchText,
  lifeEvents,
  resolveLifeEventItem,
  serviceGuides,
  type ResolvedLifeEventItem,
} from '../../data/serviceGuides';
import { SectionHeading } from '../statistics/StatisticsDashboard';

const ATOP_URL = 'https://www.aparri.org.ph/e_services';

const resolvedEvents = lifeEvents.map(event => ({
  ...event,
  links: event.items
    .map(resolveLifeEventItem)
    .filter((item): item is ResolvedLifeEventItem => item !== null),
}));

function ServiceLink({ item }: { item: ResolvedLifeEventItem }) {
  const content = (
    <>
      <span className="min-w-0 flex-1">{item.label}</span>
      {item.external ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-gray-500">
          ATOP
          <i aria-hidden="true" className="ri-external-link-line" />
        </span>
      ) : (
        <span className="shrink-0 rounded-sm bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-800">
          Guide
        </span>
      )}
    </>
  );
  const className = cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100',
    item.external ? 'text-gray-700' : 'font-medium text-gray-900'
  );

  return item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={`${item.label} (official page on ATOP, opens in a new tab)`}
    >
      {content}
    </a>
  ) : (
    <Link to={item.href} className={className}>
      {content}
    </Link>
  );
}

function SearchResults({ query }: { query: string }) {
  const guides = serviceGuides.filter(guide =>
    guideSearchText(guide).includes(query)
  );
  const guideSlugs = new Set(guides.map(guide => guide.slug));
  const seen = new Set<string>();
  const otherLinks = resolvedEvents
    .flatMap(event =>
      event.links.map(link => ({ link, eventTitle: event.title }))
    )
    .filter(({ link, eventTitle }) => {
      if (link.guide && guideSlugs.has(link.guide.slug)) return false;
      if (seen.has(link.href)) return false;
      const match = `${link.label} ${eventTitle}`.toLowerCase().includes(query);
      if (match) seen.add(link.href);
      return match;
    });
  const categories = serviceCategories.categories.filter(category =>
    `${category.category} ${category.description}`.toLowerCase().includes(query)
  );
  const total = guides.length + otherLinks.length + categories.length;

  if (total === 0) {
    return (
      <Card className="border-primary-100 bg-gray-50">
        <CardContent className="p-6 text-sm text-gray-600">
          No services match your search. Try a simpler word like
          &ldquo;birth&rdquo;, &ldquo;permit&rdquo; or &ldquo;clearance&rdquo;,
          or browse the{' '}
          <a
            href={ATOP_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-700 underline"
          >
            full list on ATOP
          </a>
          .
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-600" aria-live="polite">
        {total} {total === 1 ? 'result' : 'results'}
      </p>
      {guides.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Step-by-step guides
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(guide => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </div>
      )}
      {otherLinks.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Official service pages
          </h2>
          <Card className="border-primary-100">
            <CardContent className="p-3">
              <ul className="divide-y divide-gray-100">
                {otherLinks.map(({ link, eventTitle }) => (
                  <li key={link.href}>
                    <ServiceLink item={link} />
                    <span className="sr-only">in {eventTitle}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      {categories.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Service categories
          </h2>
          <CategoryGrid categories={categories} />
        </div>
      )}
    </div>
  );
}

function CategoryGrid({
  categories,
}: {
  categories: typeof serviceCategories.categories;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(category => (
        <Link
          key={category.slug}
          to={`/services/${category.slug}`}
          className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
        >
          <i
            aria-hidden="true"
            className={cn(category.icon, 'mt-0.5 text-xl text-sky-600')}
          />
          <span className="min-w-0">
            <span className="block font-medium text-gray-900 group-hover:text-primary-700">
              {category.category}
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              {category.description}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function ServicesLanding() {
  const [searchQuery, setSearchQuery] = useState('');
  const query = searchQuery.trim().toLowerCase();
  const facebookUrl = import.meta.env.VITE_FACEBOOK_URL as string | undefined;

  return (
    <>
      <SEO
        title="Citizen Services"
        description={`Step-by-step guides to local government services in ${import.meta.env.VITE_GOVERNMENT_NAME}: what to bring, where to go, how much it costs and how long it takes.`}
        keywords="government services, business permit, birth registration, marriage license, mayor's clearance, citizen's charter, Aparri"
        pageType="CollectionPage"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/services' },
        ]}
      />
      <Section className="mb-12 p-3">
        <Breadcrumbs className="mb-8" />
        <Heading className="mb-2 flex items-center gap-3">
          <i
            aria-hidden="true"
            className="ri-gallery-view-2 text-sm text-sky-600 md:text-5xl"
          />
          Citizen Services
        </Heading>
        <Text className="mb-6 max-w-3xl text-gray-600">
          What do you need to get done? Find out what to bring, where to go, how
          much it costs and how long it takes, before you go to the Municipal
          Hall.
        </Text>
        <div className="relative mb-10">
          <label htmlFor="service-search" className="sr-only">
            Search services
          </label>
          <i
            aria-hidden="true"
            className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            id="service-search"
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search e.g. birth certificate, business permit, cedula..."
            className="w-full rounded-md border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {query ? (
          <SearchResults query={query} />
        ) : (
          <div className="space-y-14">
            <section>
              <SectionHeading
                eyebrow="Start here"
                title="Step-by-step guides"
                description={`${serviceGuides.length} of the most-requested services, explained in plain language. More guides are being added.`}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {serviceGuides.map(guide => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeading
                eyebrow="By life event"
                title="What do you need to do?"
                description="Services are grouped by what is happening in your life, not by which office handles them."
              />
              <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <span className="rounded-sm bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">
                    Guide
                  </span>
                  Full guide on this site
                </span>
                <span className="inline-flex items-center gap-1">
                  ATOP
                  <i aria-hidden="true" className="ri-external-link-line" />
                  Official page on the town&rsquo;s portal (opens in a new tab)
                </span>
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {resolvedEvents.map(event => (
                  <Card
                    key={event.slug}
                    id={event.slug}
                    className="card-fade-in h-full scroll-mt-24 border-primary-100 target:ring-2 target:ring-primary-400"
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
                        >
                          <i className={cn(event.icon, 'text-lg')} />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <ul className="-mx-3">
                        {event.links.map(link => (
                          <li key={link.href}>
                            <ServiceLink item={link} />
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <SectionHeading
                eyebrow="By office"
                title="Browse all service categories"
                description="Looking for something else? Browse services by the office that handles them."
              />
              <CategoryGrid categories={serviceCategories.categories} />
            </section>

            <Card className="border-primary-100 bg-gray-50">
              <CardContent className="p-6 text-sm leading-relaxed text-gray-600">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  Where this information comes from
                </h2>
                <p>
                  Guides are based on the LGU Citizen&rsquo;s Charter published
                  on{' '}
                  <a
                    href={ATOP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary-700 underline"
                  >
                    ATOP (Aparri Town Online Portal)
                  </a>
                  , rewritten in plain language. Each guide shows the date it
                  was last checked. Requirements and fees can change, so call
                  the Municipal Hall at 078-888-2001 (Mon to Fri, 8 AM to 5 PM)
                  if you are unsure.
                  {facebookUrl && (
                    <>
                      {' '}
                      Found something different at the office?{' '}
                      <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary-700 underline"
                      >
                        Let us know on Facebook
                      </a>
                      .
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </Section>
    </>
  );
}
