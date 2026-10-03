import yaml from 'js-yaml';
import lifeEventsYaml from '../../content/services/life-events.yaml?raw';

/**
 * Plain-language service guides.
 *
 * Each guide lives in `content/services/guides/<slug>.yaml` and is based
 * on the LGU Citizen's Charter as published on ATOP
 * (https://www.aparri.org.ph/e_services). Guides are small, so they are
 * loaded eagerly: the services landing page needs all of them to show
 * fees, times and search results without a loading state.
 */

export interface GuideRequirement {
  item: string;
  from: string;
  note?: string;
  optional?: boolean;
}

export interface GuideStep {
  title: string;
  detail?: string;
  where?: string;
  time?: string;
}

export interface GuideFact {
  label: string;
  detail?: string;
}

export interface GuideNotice {
  tone: 'info' | 'warning';
  text: string;
}

export interface GuideLink {
  label: string;
  url: string;
}

export interface ServiceGuide {
  slug: string;
  category: string;
  icon: string;
  title: string;
  officialName: string;
  summary: string;
  whoCanApply: string;
  office: string;
  location?: string;
  fee: GuideFact;
  time: GuideFact;
  beforeYouGo?: string[];
  requirements: GuideRequirement[];
  steps: GuideStep[];
  afterward?: string[];
  terms?: { term: string; description: string }[];
  notices?: GuideNotice[];
  source: GuideLink & { checked: string };
  relatedLinks?: GuideLink[];
  keywords?: string[];
}

export interface LifeEventItem {
  /** Slug of an internal guide. */
  guide?: string;
  /** Label for an external (ATOP) link. Ignored when `guide` is set. */
  label?: string;
  url?: string;
}

export interface LifeEvent {
  slug: string;
  title: string;
  description: string;
  icon: string;
  items: LifeEventItem[];
}

/** A life-event item resolved to something a link can render. */
export interface ResolvedLifeEventItem {
  label: string;
  href: string;
  external: boolean;
  guide?: ServiceGuide;
}

const guideFiles = import.meta.glob<string>(
  '../../content/services/guides/*.yaml',
  { query: '?raw', import: 'default', eager: true }
);

export const serviceGuides: ServiceGuide[] = Object.values(guideFiles)
  .map(raw => yaml.load(raw) as ServiceGuide)
  .sort((a, b) => a.title.localeCompare(b.title));

const guidesBySlug = new Map(serviceGuides.map(guide => [guide.slug, guide]));

export function getServiceGuide(slug: string | undefined) {
  return slug ? guidesBySlug.get(slug) : undefined;
}

export function getGuidesForCategory(category: string | undefined) {
  return serviceGuides.filter(guide => guide.category === category);
}

export function guideHref(guide: ServiceGuide) {
  return `/services/${guide.category}/${guide.slug}`;
}

export const lifeEvents: LifeEvent[] =
  (yaml.load(lifeEventsYaml) as { events: LifeEvent[] }).events ?? [];

export function resolveLifeEventItem(
  item: LifeEventItem
): ResolvedLifeEventItem | null {
  if (item.guide) {
    const guide = guidesBySlug.get(item.guide);
    if (!guide) return null;
    return {
      label: guide.title,
      href: guideHref(guide),
      external: false,
      guide,
    };
  }
  if (item.label && item.url) {
    return { label: item.label, href: item.url, external: true };
  }
  return null;
}

/** Text used to match a guide against a search query. */
export function guideSearchText(guide: ServiceGuide) {
  return [
    guide.title,
    guide.officialName,
    guide.summary,
    guide.office,
    ...guide.requirements.map(r => `${r.item} ${r.from}`),
    ...(guide.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "October 3, 2026". */
export function formatCheckedDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
