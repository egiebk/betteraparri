/**
 * DPWH Projects page: national infrastructure projects in and around Aparri.
 * Same explorer pattern as the Procurement page, plus project status,
 * progress, type, barangay and location.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import {
  loadDpwhProjectsData,
  type DpwhData,
  type DpwhRecord,
} from '../../lib/dataLoader';
import {
  downloadCsv,
  formatDate,
  formatPeso,
  formatPesoExact,
  normalizeText,
} from '../../lib/contracts';
import {
  ChipGroup,
  FilterChip,
  IntroCard,
  TopContractors,
  YearChart,
} from './contracts/ContractWidgets';
import {
  LoadingState,
  ProvenanceBar,
  SectionHeading,
  SourcesCard,
  StatTile,
  TermsCard,
} from './StatisticsDashboard';

const PAGE_SIZE = 20;

type StatusKey = 'completed' | 'ongoing' | 'not-started';
type LocationKey = 'aparri' | 'nearby';
type SortKey = 'year-desc' | 'year-asc' | 'amount-desc' | 'amount-asc';

const statusInfo: Record<
  StatusKey,
  { label: string; pill: string; bar: string; icon: string }
> = {
  completed: {
    label: 'Completed',
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bar: 'bg-emerald-600',
    icon: 'ri-checkbox-circle-line',
  },
  ongoing: {
    label: 'Ongoing',
    pill: 'bg-sky-50 text-sky-800 border-sky-200',
    bar: 'bg-sky-600',
    icon: 'ri-hammer-line',
  },
  'not-started': {
    label: 'Not yet started',
    pill: 'bg-amber-50 text-amber-900 border-amber-200',
    bar: 'bg-amber-500',
    icon: 'ri-time-line',
  },
};

const sortLabels: Record<SortKey, string> = {
  'year-desc': 'Newest first',
  'year-asc': 'Oldest first',
  'amount-desc': 'Highest amount first',
  'amount-asc': 'Lowest amount first',
};

function statusOf(r: DpwhRecord): StatusKey {
  if (r.status === 'Completed') return 'completed';
  if (r.status === 'On-Going') return 'ongoing';
  return 'not-started';
}

const yearOfRecord = (r: DpwhRecord) => r.year ?? null;
const nameOfRecord = (r: DpwhRecord) => r.contractorName;

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: StatusKey }) {
  const info = statusInfo[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        info.pill
      )}
    >
      <i aria-hidden="true" className={info.icon} />
      {info.label}
    </span>
  );
}

function ProjectRow({
  record,
  onContractor,
}: {
  record: DpwhRecord;
  onContractor: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const status = statusOf(record);
  const progress = Math.min(Math.max(record.progress ?? 0, 0), 100);

  return (
    <li className="px-5 py-4 sm:px-6">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusPill status={status} />
            {record.barangay && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <i aria-hidden="true" className="ri-map-pin-line" />
                {record.barangay}
              </span>
            )}
            {!record.inAparri || record.location !== 'Aparri' ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800">
                <i aria-hidden="true" className="ri-map-pin-line" />
                {record.location}
              </span>
            ) : null}
          </div>
          <h3
            className={cn(
              'break-words text-sm font-semibold leading-snug text-gray-950 sm:text-base',
              !open && 'line-clamp-3'
            )}
          >
            {record.title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-600">
            {record.contractorName ? (
              <button
                type="button"
                onClick={() => onContractor(record.contractorName as string)}
                className="text-left font-medium text-primary-700 underline-offset-4 hover:underline"
                title="Show all projects of this contractor"
              >
                {record.contractorName}
              </button>
            ) : (
              <span className="text-gray-500">
                No contractor yet (being bid out)
              </span>
            )}
          </p>
          {status === 'ongoing' && (
            <div className="mt-3 flex max-w-sm items-center gap-3">
              <span
                className="h-2 flex-1 rounded-full bg-gray-100"
                role="img"
                aria-label={`${progress}% complete`}
              >
                <span
                  className="block h-2 rounded-full bg-sky-600"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </span>
              <span className="text-xs font-semibold tabular-nums text-gray-700">
                {progress}% done
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
          >
            {open ? 'Hide details' : 'More details'}
            <i
              aria-hidden="true"
              className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
            />
          </button>
          {open && (
            <dl className="mt-3 grid gap-x-6 gap-y-2 rounded-md bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">Contract ID</dt>
                <dd className="font-mono text-gray-900">
                  {record.contractNo || record.referenceId || 'Not reported'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Handled by</dt>
                <dd className="text-gray-900">{record.procuringEntity}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Type</dt>
                <dd className="text-gray-900">{record.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Program year</dt>
                <dd className="text-gray-900">
                  {record.year ?? 'Not reported'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Location</dt>
                <dd className="text-gray-900">
                  {record.barangay
                    ? `Barangay ${record.barangay}, Aparri`
                    : record.location}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Started</dt>
                <dd className="text-gray-900">
                  {formatDate(record.awardDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Completed</dt>
                <dd className="text-gray-900">
                  {record.completionDate
                    ? formatDate(record.completionDate)
                    : 'Not yet'}
                </dd>
              </div>
              {record.budget > 0 && (
                <div>
                  <dt className="text-xs text-gray-500">Exact amount</dt>
                  <dd className="tabular-nums text-gray-900">
                    {formatPesoExact(record.budget)}
                  </dd>
                </div>
              )}
              {record.contractorFormerName && (
                <div>
                  <dt className="text-xs text-gray-500">
                    Contractor formerly known as
                  </dt>
                  <dd className="text-gray-900">
                    {record.contractorFormerName}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-4 sm:block sm:text-right">
          <p className="text-lg font-bold tabular-nums text-gray-950">
            {record.budget > 0 ? formatPeso(record.budget) : '—'}
          </p>
          <p className="text-sm text-gray-600 sm:mt-1">
            {record.year ? `${record.year} program` : ''}
          </p>
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DpwhProjectsDashboard() {
  const [data, setData] = useState<DpwhData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    loadDpwhProjectsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const query = searchParams.get('q') ?? '';
  const year = searchParams.get('year');
  const contractor = searchParams.get('contractor');
  const type = searchParams.get('type');
  const barangay = searchParams.get('barangay');
  const statusParam = searchParams.get('status') as StatusKey | null;
  const status = statusParam && statusParam in statusInfo ? statusParam : null;
  const locParam = searchParams.get('location');
  const location: LocationKey | null =
    locParam === 'aparri' || locParam === 'nearby' ? locParam : null;
  const sortParam = searchParams.get('sort') as SortKey | null;
  const sort: SortKey =
    sortParam && sortParam in sortLabels ? sortParam : 'year-desc';

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
  const clearAll = () =>
    update({
      q: null,
      year: null,
      contractor: null,
      type: null,
      barangay: null,
      status: null,
      location: null,
    });

  const records = useMemo(() => data?.records ?? [], [data]);

  const filtered = useMemo(() => {
    const tokens = normalizeText(query).split(' ').filter(Boolean);
    return records
      .filter(r => {
        if (year && r.year !== year) return false;
        if (contractor && r.contractorName !== contractor) return false;
        if (type && r.type !== type) return false;
        if (barangay && r.barangay !== barangay) return false;
        if (status && statusOf(r) !== status) return false;
        if (location === 'aparri' && r.location !== 'Aparri') return false;
        if (location === 'nearby' && r.location === 'Aparri') return false;
        if (tokens.length) {
          const text = normalizeText(
            [
              r.title,
              r.contractorName ?? '',
              r.contractorFormerName ?? '',
              r.contractNo,
              r.barangay ?? '',
              r.type,
            ].join(' ')
          );
          if (!tokens.every(t => text.includes(t))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === 'amount-desc') return b.budget - a.budget;
        if (sort === 'amount-asc') {
          // Unpriced projects go last.
          return (a.budget || Infinity) - (b.budget || Infinity);
        }
        const ya = Number(a.year ?? 0);
        const yb = Number(b.year ?? 0);
        if (ya !== yb) return sort === 'year-asc' ? ya - yb : yb - ya;
        const da = a.awardDate ? Date.parse(a.awardDate) : 0;
        const db = b.awardDate ? Date.parse(b.awardDate) : 0;
        return sort === 'year-asc' ? da - db : db - da;
      });
  }, [
    records,
    query,
    year,
    contractor,
    type,
    barangay,
    status,
    location,
    sort,
  ]);

  if (loading) return <LoadingState label="Loading DPWH projects..." />;
  if (!data || records.length === 0) {
    return <LoadingState label="No DPWH project data available." />;
  }

  const content = data.content;
  const total = records.reduce((s, r) => s + r.budget, 0);
  const unpriced = records.filter(r => !r.budget).length;
  const counts = {
    completed: records.filter(r => statusOf(r) === 'completed').length,
    ongoing: records.filter(r => statusOf(r) === 'ongoing').length,
    'not-started': records.filter(r => statusOf(r) === 'not-started').length,
  };
  const filteredTotal = filtered.reduce((s, r) => s + r.budget, 0);

  const typeOptions = [...new Set(records.map(r => r.type))].sort();
  const years = [...new Set(records.map(r => r.year).filter(Boolean))]
    .sort()
    .reverse() as string[];
  const contractors = [
    ...new Set(records.map(r => r.contractorName).filter(Boolean)),
  ].sort() as string[];
  const barangays = (
    [...new Set(records.map(r => r.barangay).filter(Boolean))] as string[]
  ).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  const moreFilterCount = [year, barangay, contractor, type, location].filter(
    Boolean
  ).length;
  const hasFilters = Boolean(
    query || year || contractor || type || barangay || status || location
  );

  const selectClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900';

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content?.hero.eyebrow ?? 'Transparency'}
          title={content?.hero.title ?? 'DPWH Projects'}
          description={content?.hero.description ?? ''}
        />
        <ProvenanceBar
          provenance={data.provenance}
          coverage={
            years.length > 0
              ? `Program years ${years[years.length - 1]}–${years[0]}`
              : undefined
          }
          asOf={data.asOf}
        />
        {content?.intro && <IntroCard text={content.intro} />}
      </section>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatTile
            icon="ri-road-map-line"
            label="Projects"
            value={records.length.toLocaleString('en-PH')}
            detail={`Program years ${years[years.length - 1]}–${years[0]}`}
          />
          <StatTile
            icon="ri-money-dollar-circle-line"
            label="Total contract amount"
            value={formatPeso(total)}
            detail={
              unpriced > 0
                ? `Not counting ${unpriced} projects still being bid out`
                : 'Sum of all contract amounts'
            }
          />
          <StatTile
            icon="ri-checkbox-multiple-line"
            label="Completed"
            value={`${counts.completed} of ${records.length}`}
            detail={`${counts.ongoing} ongoing, ${counts['not-started']} not yet started`}
          />
        </div>
      </section>

      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          <YearChart
            records={records}
            yearOf={yearOfRecord}
            title="Projects by year"
            description="Select a year to see its projects."
            countLabel="projects"
            selected={year}
            onSelect={y => update({ year: y })}
          />
          <TopContractors
            records={records}
            nameOf={nameOfRecord}
            limit={5}
            countLabel={['project', 'projects']}
            selected={contractor}
            onSelect={c => update({ contractor: c })}
          />
        </div>
      </section>

      <section id="projects">
        <SectionHeading
          eyebrow="All Projects"
          title="Browse the Projects"
          description="Search or filter to find a project."
        />
        <Card className="border-primary-100">
          <CardHeader className="space-y-4 bg-stone-100">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search projects</span>
                <i
                  aria-hidden="true"
                  className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={query}
                  onChange={e => update({ q: e.target.value })}
                  placeholder="Search project, barangay or contractor"
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

            <ChipGroup
              label="Status"
              value={status}
              onChange={s => update({ status: s })}
              options={[
                { value: null, label: 'All', count: records.length },
                ...(Object.keys(statusInfo) as StatusKey[]).map(k => ({
                  value: k,
                  label: statusInfo[k].label,
                  count: counts[k],
                })),
              ]}
            />

            {showMore && (
              <div className="grid gap-3 rounded-md border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
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
                  {typeOptions.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Barangay"
                  value={barangay ?? ''}
                  onChange={e => update({ barangay: e.target.value || null })}
                  className={selectClass}
                >
                  <option value="">Any barangay</option>
                  {barangays.map(b => (
                    <option key={b} value={b}>
                      {b}
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
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Location"
                  value={location ?? ''}
                  onChange={e => update({ location: e.target.value || null })}
                  className={selectClass}
                >
                  <option value="">Aparri and nearby towns</option>
                  <option value="aparri">Aparri only</option>
                  <option value="nearby">Nearby towns only</option>
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
                {barangay && (
                  <FilterChip
                    label={`Barangay ${barangay}`}
                    onRemove={() => update({ barangay: null })}
                  />
                )}
                {contractor && (
                  <FilterChip
                    label={contractor}
                    onRemove={() => update({ contractor: null })}
                  />
                )}
                {location && (
                  <FilterChip
                    label={
                      location === 'aparri' ? 'Aparri only' : 'Nearby towns'
                    }
                    onRemove={() => update({ location: null })}
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
              <strong className="text-gray-900">{filtered.length}</strong>{' '}
              {filtered.length === 1 ? 'project' : 'projects'} ·{' '}
              {formatPeso(filteredTotal)}
            </p>
            <div className="flex items-center gap-2">
              <select
                aria-label="Sort"
                value={sort}
                onChange={e =>
                  update({
                    sort:
                      e.target.value === 'year-desc' ? null : e.target.value,
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
                title="Download these projects as a CSV file"
                onClick={() =>
                  downloadCsv(
                    'aparri-dpwh-projects.csv',
                    [
                      'Title',
                      'Status',
                      'Progress (%)',
                      'Type',
                      'Barangay',
                      'Location',
                      'Contractor',
                      'Contract amount (PHP)',
                      'Program year',
                      'Started',
                      'Completed',
                      'Contract ID',
                      'Handled by',
                    ],
                    filtered.map(r => [
                      r.title,
                      statusInfo[statusOf(r)].label,
                      r.progress,
                      r.type,
                      r.barangay,
                      r.location,
                      r.contractorName,
                      r.budget.toFixed(2),
                      r.year,
                      r.awardDate,
                      r.completionDate,
                      r.contractNo,
                      r.procuringEntity,
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
                No projects match these filters.{' '}
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
                  {filtered.slice(0, visible).map(r => (
                    <ProjectRow
                      key={r.id}
                      record={r}
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
