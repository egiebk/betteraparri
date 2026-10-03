/**
 * Shared building blocks for the Statistics pages
 * (Demographics and Competitiveness dashboards).
 */
import { type ReactNode } from 'react';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { type SourceLink } from '../../lib/dataLoader';

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
      <Text className="mb-4 text-gray-600">{description}</Text>
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
    <Card className="border-primary-100 bg-gray-50">
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
