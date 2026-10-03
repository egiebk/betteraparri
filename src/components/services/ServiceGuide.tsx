import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@bettergov/kapwa/card';
import Section from '../ui/Section';
import Breadcrumbs from '../ui/Breadcrumbs';
import SEO from '../SEO';
import { cn } from '../../lib/utils';
import { serviceCategories } from '../../data/yamlLoader';
import {
  formatCheckedDate,
  guideHref,
  type GuideNotice,
  type ServiceGuide as ServiceGuideData,
} from '../../data/serviceGuides';
import { SourcesCard, TermsCard } from '../statistics/StatisticsDashboard';

function Notice({ notice }: { notice: GuideNotice }) {
  const warning = notice.tone === 'warning';
  return (
    <div
      role="note"
      className={cn(
        'flex gap-3 rounded-xl border p-4 text-sm leading-relaxed',
        warning
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-sky-200 bg-sky-50 text-sky-900'
      )}
    >
      <i
        aria-hidden="true"
        className={cn(
          'mt-0.5 text-lg',
          warning ? 'ri-error-warning-line' : 'ri-information-line'
        )}
      />
      <p>{notice.text}</p>
    </div>
  );
}

function FactTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: string;
}) {
  return (
    <Card className="h-full border-primary-100">
      <CardContent className="flex h-full gap-4 p-5">
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700"
        >
          <i className={cn(icon, 'text-lg')} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-lg font-bold leading-snug text-gray-900">
            {value}
          </p>
          {detail && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {detail}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
      <i aria-hidden="true" className={cn(icon, 'text-primary-600')} />
      {children}
    </h2>
  );
}

function RequirementsChecklist({ guide }: { guide: ServiceGuideData }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const required = guide.requirements.filter(r => !r.optional).length;
  const requiredChecked = guide.requirements.filter(
    (r, index) => !r.optional && checked.has(index)
  ).length;

  const toggle = (index: number) =>
    setChecked(previous => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

  return (
    <Card className="h-full border-primary-100">
      <CardContent className="p-6">
        <SectionTitle icon="ri-checkbox-multiple-line">
          What to bring
        </SectionTitle>
        <p className="mb-4 text-sm text-gray-600">
          Tick each item as you get it.{' '}
          <span className="font-semibold text-gray-900">
            {requiredChecked} of {required}
          </span>{' '}
          required items ready.
        </p>
        <div
          aria-hidden="true"
          className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100 print:hidden"
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${required ? (requiredChecked / required) * 100 : 0}%`,
            }}
          />
        </div>
        <ul className="space-y-3">
          {guide.requirements.map((requirement, index) => {
            const id = `${guide.slug}-req-${index}`;
            const isChecked = checked.has(index);
            return (
              <li key={id}>
                <label
                  htmlFor={id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
                    isChecked
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-primary-200'
                  )}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(index)}
                    className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block font-medium text-gray-900',
                        isChecked && 'line-through decoration-emerald-600/60'
                      )}
                    >
                      {requirement.item}
                      {requirement.optional && (
                        <span className="ml-2 inline-block rounded-sm bg-gray-100 px-1.5 py-0.5 align-middle text-xs font-medium text-gray-600">
                          If it applies
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Get it from:
                      </span>{' '}
                      {requirement.from}
                    </span>
                    {requirement.note && (
                      <span className="mt-1 block text-sm text-gray-500">
                        {requirement.note}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function StepsList({ guide }: { guide: ServiceGuideData }) {
  return (
    <Card className="h-full border-primary-100">
      <CardContent className="p-6">
        <SectionTitle icon="ri-route-line">Step by step</SectionTitle>
        <ol className="relative space-y-6">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4">
              {index < guide.steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-4 top-9 -bottom-6 w-px bg-primary-100"
                />
              )}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p className="font-semibold text-gray-900">{step.title}</p>
                {step.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {step.detail}
                  </p>
                )}
                {(step.where || step.time) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {step.where && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
                        <i aria-hidden="true" className="ri-map-pin-line" />
                        {step.where}
                      </span>
                    )}
                    {step.time && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
                        <i aria-hidden="true" className="ri-time-line" />
                        {step.time}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export default function ServiceGuide({ guide }: { guide: ServiceGuideData }) {
  const category = serviceCategories.categories.find(
    c => c.slug === guide.category
  );
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    ...(category
      ? [{ label: category.category, href: `/services/${category.slug}` }]
      : []),
    { label: guide.title, href: guideHref(guide) },
  ];

  return (
    <>
      <SEO
        title={guide.title}
        description={guide.summary}
        keywords={[guide.title, guide.officialName, ...(guide.keywords ?? [])]
          .join(', ')
          .toLowerCase()}
        pageType="GovernmentService"
        breadcrumbs={breadcrumbs}
      />
      <Section className="mb-12 p-3">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />

        <header className="mb-8 max-w-4xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
            Step-by-step guide
          </p>
          <h1 className="mb-3 flex items-start gap-3 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            <i
              aria-hidden="true"
              className={cn(guide.icon, 'mt-1 text-sky-600')}
            />
            {guide.title}
          </h1>
          <p className="text-lg leading-relaxed text-gray-700">
            {guide.summary}
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Official name: {guide.officialName}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <i aria-hidden="true" className="ri-printer-line" />
              Print this guide
            </button>
            <a
              href={guide.source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <i aria-hidden="true" className="ri-external-link-line" />
              Official page on ATOP
            </a>
          </div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FactTile
            label="How much"
            value={guide.fee.label}
            detail={guide.fee.detail}
            icon="ri-money-dollar-circle-line"
          />
          <FactTile
            label="How long"
            value={guide.time.label}
            detail={guide.time.detail}
            icon="ri-time-line"
          />
          <FactTile
            label="Where to go"
            value={guide.office}
            detail={guide.location}
            icon="ri-map-pin-line"
          />
          <FactTile
            label="Who can apply"
            value={guide.whoCanApply}
            detail="Ask the office if you are applying for someone else."
            icon="ri-user-line"
          />
        </div>

        {guide.notices && guide.notices.length > 0 && (
          <div className="mb-8 space-y-3">
            {guide.notices.map(notice => (
              <Notice key={notice.text} notice={notice} />
            ))}
          </div>
        )}

        {guide.beforeYouGo && guide.beforeYouGo.length > 0 && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <SectionTitle icon="ri-lightbulb-flash-line">
                Before you go
              </SectionTitle>
              <ul className="grid gap-3 md:grid-cols-2">
                {guide.beforeYouGo.map(tip => (
                  <li
                    key={tip}
                    className="flex gap-2 text-sm leading-relaxed text-gray-800"
                  >
                    <i
                      aria-hidden="true"
                      className="ri-check-line mt-0.5 text-amber-600"
                    />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          <RequirementsChecklist guide={guide} />
          <StepsList guide={guide} />
        </div>

        {guide.afterward && guide.afterward.length > 0 && (
          <Card className="mb-8 border-primary-100">
            <CardContent className="p-6">
              <SectionTitle icon="ri-flag-line">After you finish</SectionTitle>
              <ul className="space-y-2">
                {guide.afterward.map(item => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-gray-700"
                  >
                    <i
                      aria-hidden="true"
                      className="ri-arrow-right-s-line mt-0.5 text-primary-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              {guide.relatedLinks && guide.relatedLinks.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.relatedLinks.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-white px-3 py-1 text-sm font-medium text-primary-700 hover:border-primary-300 hover:underline"
                    >
                      {link.label}
                      <i aria-hidden="true" className="ri-external-link-line" />
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {guide.terms && guide.terms.length > 0 && (
          <div className="mb-8">
            <TermsCard title="Words you might hear" terms={guide.terms} />
          </div>
        )}

        <SourcesCard
          note={`Based on the LGU Citizen's Charter published on ATOP (Aparri Town Online Portal), last checked ${formatCheckedDate(
            guide.source.checked
          )}. Requirements and fees can change, so call the Municipal Hall at 078-888-2001 (Mon to Fri, 8 AM to 5 PM) if you are unsure.`}
          sourceLinks={[{ label: guide.source.label, href: guide.source.url }]}
        />

        <div className="mt-8 print:hidden">
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
          >
            <i aria-hidden="true" className="ri-arrow-left-line" />
            Back to all services
          </Link>
        </div>
      </Section>
    </>
  );
}
