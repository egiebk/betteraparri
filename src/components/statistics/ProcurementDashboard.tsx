/**
 * Procurement page: an explorer for contracts awarded by the municipality.
 * Overview, contracts-by-year chart, top contractors, and a filterable,
 * paginated list. Filters live in the URL so a view can be shared.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import {
  loadProcurementData,
  type ProcurementData,
  type ProcurementRecord,
} from '../../lib/dataLoader';
import {
  downloadCsv,
  formatDate,
  formatPeso,
  formatPesoExact,
  normalizeText,
} from '../../lib/contracts';
import {
  FilterChip,
  IntroCard,
  TopContractors,
  YearChart,
} from './contracts/ContractWidgets';
import {
  LoadingState,
  SectionHeading,
  SourcesCard,
  StatTile,
  TermsCard,
} from './StatisticsDashboard';

const PAGE_SIZE = 20;

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const sortLabels: Record<SortKey, string> = {
  'date-desc': 'Newest first',
  'date-asc': 'Oldest first',
  'amount-desc': 'Highest amount first',
  'amount-asc': 'Lowest amount first',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const yearOfRecord = (r: ProcurementRecord) => yearOf(r);
const nameOfRecord = (r: ProcurementRecord) => r.awardee || null;

function yearOf(record: ProcurementRecord) {
  return record.awardDate ? record.awardDate.slice(0, 4) : 'Unknown';
}

/** Contractor names are shown as recorded in the source. */
function displayName(value: string) {
  return value || 'Not reported';
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function RecordRow({
  record,
  showType,
  onContractor,
}: {
  record: ProcurementRecord;
  showType: boolean;
  onContractor: (name: string) => void;
}) {
  const reference = record.referenceId || record.contractNo;
  return (
    <li className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6 sm:px-6">
      <div className="min-w-0">
        <h3 className="break-words font-semibold leading-snug text-gray-950">
          {record.title}
        </h3>
        <p className="mt-1.5 text-sm text-gray-600">
          <button
            type="button"
            onClick={() => onContractor(record.awardee)}
            className="text-left font-medium text-primary-700 underline-offset-4 hover:underline"
            title="Show all contracts of this contractor"
          >
            {displayName(record.awardee)}
          </button>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          {showType && (
            <span className="inline-flex items-center rounded-sm bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
              {record.classification}
            </span>
          )}
          {reference && <span className="font-mono">Ref. {reference}</span>}
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-4 sm:block sm:text-right">
        <p
          className="text-lg font-bold tabular-nums text-gray-950"
          title={formatPesoExact(record.budget)}
        >
          {formatPeso(record.budget)}
        </p>
        <p className="text-sm text-gray-600 sm:mt-1">
          {formatDate(record.awardDate)}
        </p>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ProcurementDashboard() {
  const [data, setData] = useState<ProcurementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    loadProcurementData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const query = searchParams.get('q') ?? '';
  const year = searchParams.get('year');
  const contractor = searchParams.get('contractor');
  const type = searchParams.get('type');
  const sortParam = searchParams.get('sort') as SortKey | null;
  const sort: SortKey =
    sortParam && sortParam in sortLabels ? sortParam : 'date-desc';

  const update = (changes: Record<string, string | null>) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([k, v]) => {
          if (v === null || v === '') next.delete(k);
          else next.set(k, v);
        });
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
    setVisible(PAGE_SIZE);
  };

  const records = useMemo(() => data?.records ?? [], [data]);

  const filtered = useMemo(() => {
    const tokens = normalizeText(query).split(' ').filter(Boolean);
    return records
      .filter(r => {
        if (year && yearOf(r) !== year) return false;
        if (contractor && r.awardee !== contractor) return false;
        if (type && r.classification !== type) return false;
        if (tokens.length) {
          const text = normalizeText(
            [
              r.title,
              r.awardee,
              r.noticeTitle,
              r.referenceId,
              r.contractNo,
            ].join(' ')
          );
          if (!tokens.every(t => text.includes(t))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'amount-desc') return b.budget - a.budget;
        if (sort === 'amount-asc') return a.budget - b.budget;
        const da = a.awardDate ? Date.parse(a.awardDate) : 0;
        const db = b.awardDate ? Date.parse(b.awardDate) : 0;
        return sort === 'date-asc' ? da - db : db - da;
      });
  }, [records, query, year, contractor, type, sort]);

  if (loading) return <LoadingState label="Loading procurement data..." />;
  if (!data || records.length === 0) {
    return <LoadingState label="No procurement data available." />;
  }

  const content = data.content;
  const total = records.reduce((s, r) => s + r.budget, 0);
  const dates = records
    .map(r => r.awardDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  const latest = dates[dates.length - 1] ?? null;
  const earliest = dates[0] ?? null;
  const filteredTotal = filtered.reduce((s, r) => s + r.budget, 0);
  const types = [...new Set(records.map(r => r.classification))].sort();
  const contractors = [...new Set(records.map(r => r.awardee))].sort((a, b) =>
    a.localeCompare(b)
  );
  const years = [...new Set(records.map(yearOf))].sort().reverse();
  const hasFilters = Boolean(query || year || contractor || type);
  const clearAll = () =>
    update({ q: null, year: null, contractor: null, type: null });
  const moreFilterCount = [year, contractor, type].filter(Boolean).length;
  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900';
  const yearsSinceLatest = latest
    ? (Date.now() - Date.parse(latest)) / (365.25 * 24 * 3600 * 1000)
    : 0;

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content?.hero.eyebrow ?? 'Transparency'}
          title={content?.hero.title ?? 'Procurement'}
          description={content?.hero.description ?? ''}
        />
        {content?.intro && <IntroCard text={content.intro} />}
        {yearsSinceLatest > 1 && (
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <i aria-hidden="true" className="ri-time-line mt-0.5" />
            <span>
              <strong>This list may be incomplete.</strong> The latest contract
              in the data is from {formatDate(latest)}.
            </span>
          </p>
        )}
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatTile
            icon="ri-file-list-3-line"
            label="Contracts"
            value={records.length.toLocaleString('en-PH')}
            detail={`${formatDate(earliest)} to ${formatDate(latest)}`}
          />
          <StatTile
            icon="ri-money-dollar-circle-line"
            label="Total amount"
            value={formatPeso(total)}
            detail="Sum of all contract amounts"
          />
          <StatTile
            icon="ri-team-line"
            label="Contractors and suppliers"
            value={contractors.length.toLocaleString('en-PH')}
            detail="Businesses that won at least one contract"
          />
        </div>
      </section>

      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          <YearChart
            records={records}
            yearOf={yearOfRecord}
            title="Contracts by year"
            description="Select a year to see its contracts."
            selected={year}
            onSelect={y => update({ year: y })}
          />
          <TopContractors
            records={records}
            nameOf={nameOfRecord}
            limit={5}
            selected={contractor}
            onSelect={c => update({ contractor: c })}
          />
        </div>
      </section>

      <section id="contracts">
        <SectionHeading
          eyebrow="All Contracts"
          title="Browse the Contracts"
          description="Search or filter to find a contract."
        />
        <Card className="border-primary-100">
          <CardHeader className="space-y-4 bg-stone-100">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search contracts</span>
                <i
                  aria-hidden="true"
                  className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => update({ q: e.target.value })}
                  placeholder="Search project or contractor"
                  className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowMore(v => !v)}
                aria-expanded={showMore}
                className={cn(
                  'inline-flex items-center justify-center gap-1.5 rounded-md border px-4 py-2.5 text-sm font-medium',
                  showMore || moreFilterCount
                    ? 'border-primary-300 bg-primary-50 text-primary-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400'
                )}
              >
                <i aria-hidden="true" className="ri-filter-3-line" />
                Filters
                {moreFilterCount > 0 && (
                  <span className="rounded-full bg-primary-700 px-1.5 text-xs text-white">
                    {moreFilterCount}
                  </span>
                )}
              </button>
            </div>

            {showMore && (
              <div className="grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-3">
                <select
                  aria-label="Year"
                  value={year ?? ''}
                  onChange={e => update({ year: e.target.value || null })}
                  className={selectClass}
                >
                  <option value="">Any year</option>
                  {years.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Type"
                  value={type ?? ''}
                  onChange={e => update({ type: e.target.value || null })}
                  className={selectClass}
                >
                  <option value="">Any type</option>
                  {types.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Contractor"
                  value={contractor ?? ''}
                  onChange={e => update({ contractor: e.target.value || null })}
                  className={selectClass}
                >
                  <option value="">Any contractor</option>
                  {contractors.map(c => (
                    <option key={c} value={c}>
                      {displayName(c)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {year && (
                  <FilterChip
                    label={year}
                    onRemove={() => update({ year: null })}
                  />
                )}
                {type && (
                  <FilterChip
                    label={type}
                    onRemove={() => update({ type: null })}
                  />
                )}
                {contractor && (
                  <FilterChip
                    label={displayName(contractor)}
                    onRemove={() => update({ contractor: null })}
                  />
                )}
                {query && (
                  <FilterChip
                    label={`“${query}”`}
                    onRemove={() => update({ q: null })}
                  />
                )}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-sm font-medium text-primary-700 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </CardHeader>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-3">
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">
                {filtered.length.toLocaleString('en-PH')}
              </strong>{' '}
              {filtered.length === 1 ? 'contract' : 'contracts'} ·{' '}
              {formatPeso(filteredTotal)}
            </p>
            <div className="flex items-center gap-2">
              <select
                aria-label="Sort"
                value={sort}
                onChange={e =>
                  update({
                    sort:
                      e.target.value === 'date-desc' ? null : e.target.value,
                  })
                }
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
              >
                {(Object.keys(sortLabels) as SortKey[]).map(k => (
                  <option key={k} value={k}>
                    {sortLabels[k]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={filtered.length === 0}
                title="Download these contracts as a CSV file"
                onClick={() =>
                  downloadCsv(
                    'aparri-procurement-contracts.csv',
                    [
                      'Title',
                      'Contractor',
                      'Type',
                      'Contract amount (PHP)',
                      'Award date',
                      'Reference',
                    ],
                    filtered.map(r => [
                      r.title,
                      r.awardee,
                      r.classification,
                      r.budget.toFixed(2),
                      r.awardDate,
                      r.referenceId || r.contractNo,
                    ])
                  )
                }
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:border-primary-400 hover:text-primary-700 disabled:opacity-50"
              >
                <i aria-hidden="true" className="ri-download-2-line" />
                CSV
              </button>
            </div>
          </div>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-600">
                No contracts match these filters.{' '}
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-medium text-primary-700 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-100">
                  {filtered.slice(0, visible).map((r, i) => (
                    <RecordRow
                      key={`${r.id}-${r.awardDate}-${r.budget}-${i}`}
                      record={r}
                      showType={r.classification !== 'Construction Projects'}
                      onContractor={name => update({ contractor: name })}
                    />
                  ))}
                </ul>
                {visible < filtered.length && (
                  <div className="border-t border-gray-100 px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setVisible(v => v + PAGE_SIZE)}
                      className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-primary-400 hover:text-primary-700"
                    >
                      Show more ({filtered.length - visible} left)
                    </button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {content?.terms && <TermsCard terms={content.terms} />}

      <SourcesCard
        note={content?.sourceNote ?? ''}
        sourceLinks={data.sourceLinks}
      />
    </div>
  );
}
