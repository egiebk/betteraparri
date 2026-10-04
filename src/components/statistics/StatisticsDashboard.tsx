/**
 * Shared building blocks for the Statistics pages
 * (Demographics and Competitiveness dashboards).
 */
import { type ReactNode } from 'react';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { GlossaryText } from '../ui/Glossary';
import { type DataProvenance, type SourceLink } from '../../lib/dataLoader';

type Term = {
  term: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 max-w-7xl">
      <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
        {eyebrow}
      </p>
      <Heading level={2} className="mb-2 text-2xl md:text-3xl">
        {title}
      </Heading>
      <Text className="mb-4 text-gray-600">
        <GlossaryText text={description} />
      </Text>
    </div>
  );
}

export function TermsCard({
  terms,
  title = 'How to Read This Page',
}: {
  terms: Term[];
  title?: string;
}) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {terms.map(term => (
            <div key={term.term} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="font-semibold text-gray-900">{term.term}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {term.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SourcesCard({
  sourceLinks = [],
  note,
}: {
  sourceLinks?: SourceLink[];
  note: string;
}) {
  return (
    <Card id="sources" className="scroll-mt-32 border-primary-100 bg-gray-50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Sources and Update Notes
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{note}</p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm text-gray-700">
          {sourceLinks.map(source => (
            <li key={`${source.label}-${source.href}`}>
              {source.href ? (
                <a
                  className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-1 font-medium text-primary-700 underline-offset-4 hover:border-primary-300 hover:underline"
                  href={source.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.label}
                </a>
              ) : (
                <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 font-medium">
                  {source.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function formatProvenanceDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Compact "where is this from and how fresh is it" badges shown under a
 * data page's title, so readers can judge the numbers before scrolling.
 * Links down to the full Sources card at the bottom of the page.
 */
export function ProvenanceBar({
  provenance,
  coverage,
  asOf,
}: {
  provenance?: DataProvenance;
  /** What period the data covers, e.g. "2018–2024". */
  coverage?: string;
  /** Snapshot date (YYYY-MM-DD); takes priority over lastUpdated. */
  asOf?: string;
}) {
  const updated = asOf ?? provenance?.lastUpdated;
  if (!provenance && !coverage && !updated) return null;

  const badge =
    'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700';

  return (
    <ul
      aria-label="About this data"
      className="mb-5 flex flex-wrap items-center gap-2"
    >
      {provenance?.source && (
        <li className={badge}>
          <i
            aria-hidden="true"
            className="ri-database-2-line text-primary-700"
          />
          <span className="text-gray-500">Source:</span>
          <span className="font-semibold text-gray-900">
            <GlossaryText text={provenance.source} />
          </span>
        </li>
      )}
      {coverage && (
        <li className={badge}>
          <i aria-hidden="true" className="ri-calendar-line text-primary-700" />
          <span className="text-gray-500">Covers:</span>
          <span className="font-mono font-semibold text-gray-900">
            {coverage}
          </span>
        </li>
      )}
      {updated && (
        <li className={badge}>
          <i aria-hidden="true" className="ri-refresh-line text-primary-700" />
          <span className="text-gray-500">
            {asOf ? 'Data as of:' : 'Last updated:'}
          </span>
          <time dateTime={updated} className="font-semibold text-gray-900">
            {formatProvenanceDate(updated)}
          </time>
        </li>
      )}
      <li>
        <a
          href="#sources"
          className="inline-flex items-center gap-1 px-1 text-xs font-medium text-primary-700 underline-offset-4 hover:underline print:hidden"
        >
          See all sources
          <i aria-hidden="true" className="ri-arrow-down-line" />
        </a>
      </li>
    </ul>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6 text-sm text-gray-600">{label}</CardContent>
    </Card>
  );
}

export function StatTile({
  label,
  value,
  detail,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  detail: ReactNode;
  icon: string;
  valueClassName?: string;
}) {
  return (
    <Card className="h-full border-primary-100">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
          >
            <i className={cn(icon, 'text-lg')} />
          </span>
        </div>
        <p
          className={cn(
            'font-mono text-3xl font-bold leading-none text-gray-900',
            valueClassName
          )}
        >
          {value}
        </p>
        <div className="mt-auto text-sm leading-relaxed text-gray-600">
          {detail}
        </div>
      </CardContent>
    </Card>
  );
}
