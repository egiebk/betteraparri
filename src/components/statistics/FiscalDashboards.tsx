/**
 * Financial Stewardship pages built from BLGF annual data:
 * Annual Regular Income (ARI), Statement of Receipts and Expenditures (SRE),
 * Disaster Fund (LDRRMF) and Special Education Fund (SEF).
 *
 * All four share the same layout: a year selector (kept in the URL),
 * an optional per-resident view, at-a-glance tiles, a breakdown for the
 * selected year, and a multi-year chart where clicking a year selects it.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import {
  loadDisasterRiskReductionData,
  loadIncomeDependencyData,
  loadSpecialEducationFundData,
  loadStatementReceiptsExpenditureData,
  type AriYear,
  type DrrmYear,
  type FiscalPageData,
  type FiscalYearBase,
  type SefYear,
  type SreYear,
} from '../../lib/dataLoader';
import {
  LoadingState,
  SectionHeading,
  SourcesCard,
  StatTile,
  TermsCard,
} from './StatisticsDashboard';

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

const palette = {
  dark: '#003d8d',
  mid: '#0066eb',
  light: '#66a3f3',
  grid: '#e5e7eb',
  axis: '#6b7280',
};

function formatPeso(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  if (abs >= 1_000_000) {
    const m = abs / 1_000_000;
    return `${sign}₱${m.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}M`;
  }
  return `${sign}₱${Math.round(abs).toLocaleString('en-PH')}`;
}

function formatAxisPeso(value: number) {
  if (value >= 1_000_000) return `₱${Math.round(value / 1_000_000)}M`;
  if (value >= 1_000) return `₱${Math.round(value / 1_000)}k`;
  return `₱${Math.round(value)}`;
}

function pct(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : 0;
}

function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

/* ------------------------------------------------------------------ */
/* Page state: year + per-resident toggle, kept in the URL             */
/* ------------------------------------------------------------------ */

function useFiscalPage<Y extends FiscalYearBase>(
  loader: () => Promise<FiscalPageData<Y> | null>
) {
  const [data, setData] = useState<FiscalPageData<Y> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loader()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loader]);

  const years = useMemo(
    () => (data ? data.years.map(y => y.year).sort((a, b) => a - b) : []),
    [data]
  );
  const latest = years[years.length - 1];
  const requested = Number(searchParams.get('year'));
  const selectedYear = years.includes(requested) ? requested : latest;
  const perResident = searchParams.get('view') === 'per-resident';

  const update = (key: string, value: string | null) =>
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );

  const yearData = data?.years.find(y => y.year === selectedYear);
  const previous = data?.years.find(y => y.year === selectedYear - 1);

  /** Format an amount for a given year, honoring the per-resident toggle. */
  const money = (value: number, year: Y | undefined = yearData) =>
    perResident && year
      ? formatPeso(value / year.population)
      : formatPeso(value);
  const scale = (value: number, year: Y) =>
    perResident ? value / year.population : value;

  return {
    data,
    loading,
    years,
    latest,
    selectedYear,
    yearData,
    previous,
    perResident,
    money,
    scale,
    selectYear: (y: number) => update('year', y === latest ? null : String(y)),
    setPerResident: (on: boolean) => update('view', on ? 'per-resident' : null),
  };
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Intro({ text }: { text: string }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="flex gap-4 p-5">
        <i
          aria-hidden="true"
          className="ri-information-line mt-0.5 text-xl text-primary-700"
        />
        <p className="text-sm leading-relaxed text-gray-700">{text}</p>
      </CardContent>
    </Card>
  );
}

function Toolbar({
  years,
  selected,
  onSelect,
  perResident,
  onPerResident,
  statusOf,
}: {
  years: number[];
  selected: number;
  onSelect: (y: number) => void;
  perResident: boolean;
  onPerResident: (on: boolean) => void;
  statusOf: (y: number) => string | undefined;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-8 border-b border-primary-100 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <span
            id="fiscal-year-label"
            className="shrink-0 text-sm font-semibold text-gray-700"
          >
            Fiscal year
          </span>
          <div
            role="radiogroup"
            aria-labelledby="fiscal-year-label"
            className="flex flex-wrap gap-1"
          >
            {years.map(year => {
              const active = year === selected;
              const prelim = statusOf(year) === 'preliminary';
              return (
                <button
                  key={year}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onSelect(year)}
                  title={prelim ? 'Preliminary figures' : undefined}
                  className={cn(
                    'min-h-[38px] shrink-0 rounded-md px-2.5 text-sm font-semibold transition sm:px-3',
                    active
                      ? 'bg-primary-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  )}
                >
                  {year}
                  {prelim && <span aria-hidden="true">*</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div
          role="radiogroup"
          aria-label="Show amounts as"
          className="flex shrink-0 self-start rounded-md bg-gray-100 p-1 xl:self-auto"
        >
          {(
            [
              [false, 'Total'],
              [true, 'Per resident'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={perResident === value}
              onClick={() => onPerResident(value)}
              className={cn(
                'min-h-[34px] rounded px-3 text-sm font-semibold transition',
                perResident === value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:text-primary-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreliminaryNote({ year }: { year: FiscalYearBase }) {
  if (year.status !== 'preliminary') return null;
  return (
    <p className="mb-8 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <i aria-hidden="true" className="ri-time-line mt-0.5" />
      <span>
        <strong>{year.year} figures are preliminary.</strong> The BLGF may still
        update them once all reports are final.
      </span>
    </p>
  );
}

function Summary({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 rounded-lg bg-primary-50 px-6 py-4 text-base leading-relaxed text-primary-900">
      {children}
    </p>
  );
}

function ChangeDetail({
  current,
  previous,
  previousYear,
}: {
  current: number;
  previous: number | undefined;
  previousYear: number | undefined;
}) {
  if (previous === undefined || previousYear === undefined || previous === 0) {
    return <>No earlier year to compare</>;
  }
  const change = pct(current - previous, previous);
  const up = change >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        up ? 'text-emerald-700' : 'text-rose-700'
      )}
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      {up ? 'Up' : 'Down'} {formatPct(Math.abs(change))} from {previousYear}
    </span>
  );
}

type BreakdownItem = {
  key: string;
  label: string;
  description?: string;
  value: number;
};

function BreakdownList({
  items,
  total,
  money,
  color = palette.mid,
}: {
  items: BreakdownItem[];
  total: number;
  money: (v: number) => string;
  color?: string;
}) {
  const visible = items
    .filter(i => i.value > 0)
    .sort((a, b) => b.value - a.value);
  const max = Math.max(...visible.map(i => i.value), 1);
  return (
    <ul className="divide-y divide-gray-100">
      {visible.map(item => (
        <li key={item.key} className="px-6 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-medium text-gray-900">{item.label}</p>
            <p className="shrink-0 tabular-nums font-semibold text-gray-900">
              {money(item.value)}
            </p>
          </div>
          {item.description && (
            <p className="mt-1 text-xs text-gray-500">{item.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="h-2 flex-1 rounded-full bg-gray-100">
              <span
                className="block h-2 rounded-full"
                style={{
                  width: `${Math.max((item.value / max) * 100, 1.5)}%`,
                  backgroundColor: color,
                }}
              />
            </span>
            <span className="w-12 text-right text-xs tabular-nums text-gray-600">
              {formatPct(pct(item.value, total))}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SplitBar({
  parts,
}: {
  parts: { label: string; value: number; color: string }[];
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div className="flex h-5 w-full gap-0.5 overflow-hidden rounded-full bg-gray-100">
        {parts
          .filter(p => p.value > 0)
          .map(p => (
            <span
              key={p.label}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${pct(p.value, total)}%`,
                backgroundColor: p.color,
              }}
              title={`${p.label}: ${formatPct(pct(p.value, total))}`}
            />
          ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
        {parts.map(p => (
          <span key={p.label} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: p.color }}
            />
            {p.label}
            <strong className="ml-1 tabular-nums">
              {formatPct(pct(p.value, total))}
            </strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  description,
  budget,
  spent,
  money,
}: {
  label: string;
  description: string;
  budget: number;
  spent: number;
  money: (v: number) => string;
}) {
  const share = pct(spent, budget);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm tabular-nums text-gray-700">
          <strong className="text-gray-900">{money(spent)}</strong> of{' '}
          {money(budget)}
        </p>
      </div>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="h-3 flex-1 rounded-full"
          style={{ backgroundColor: '#dbe8fb' }}
          role="img"
          aria-label={`${formatPct(share)} spent`}
        >
          <span
            className="block h-3 rounded-full"
            style={{
              width: `${Math.min(share, 100)}%`,
              backgroundColor: palette.dark,
            }}
          />
        </span>
        <span className="w-14 text-right text-sm font-semibold tabular-nums text-gray-900">
          {formatPct(share)}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-year bar chart                                                */
/* ------------------------------------------------------------------ */

type Series = { label: string; color: string; values: number[] };

const CW = 720;
const CH = 280;
const CP = { top: 16, right: 12, bottom: 34, left: 60 };

function YearBarChart({
  years,
  series,
  stacked = false,
  selectedYear,
  onSelect,
  format,
  footnote,
}: {
  years: number[];
  series: Series[];
  stacked?: boolean;
  selectedYear: number;
  onSelect: (y: number) => void;
  format: (v: number) => string;
  footnote?: (index: number) => string | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const plotW = CW - CP.left - CP.right;
  const plotH = CH - CP.top - CP.bottom;
  const totals = years.map((_, i) =>
    stacked
      ? series.reduce((s, ser) => s + ser.values[i], 0)
      : Math.max(...series.map(ser => ser.values[i]))
  );
  const rawMax = Math.max(...totals, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const niceMax = Math.ceil(rawMax / magnitude) * magnitude;
  const y = (v: number) => CP.top + plotH - (v / niceMax) * plotH;
  const band = plotW / years.length;
  const groupW = band * 0.7;
  const barW = stacked ? groupW : groupW / series.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * niceMax);
  const active = hover ?? years.indexOf(selectedYear);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Bar chart of ${series
          .map(s => s.label)
          .join(' and ')} from ${years[0]} to ${years[years.length - 1]}.`}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map(t => (
          <g key={t}>
            <line
              x1={CP.left}
              x2={CW - CP.right}
              y1={y(t)}
              y2={y(t)}
              stroke={palette.grid}
            />
            <text
              x={CP.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={palette.axis}
            >
              {format(t)}
            </text>
          </g>
        ))}
        {years.map((yr, i) => {
          const x0 = CP.left + band * i + (band - groupW) / 2;
          const selected = yr === selectedYear;
          let stackBase = 0;
          return (
            <g key={yr}>
              {selected && (
                <rect
                  x={CP.left + band * i + 2}
                  y={CP.top}
                  width={band - 4}
                  height={plotH}
                  rx={4}
                  fill="#eef4fd"
                />
              )}
              {series.map((ser, si) => {
                const v = ser.values[i];
                const h = Math.max((v / niceMax) * plotH, v > 0 ? 1 : 0);
                const bx = stacked ? x0 : x0 + barW * si;
                const by = stacked ? y(stackBase + v) : y(v);
                stackBase += v;
                return (
                  <rect
                    key={ser.label}
                    x={bx + (stacked ? 0 : 1)}
                    y={by}
                    width={Math.max(barW - (stacked ? 0 : 2), 1)}
                    height={h}
                    rx={2}
                    fill={ser.color}
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                );
              })}
              <text
                x={CP.left + band * i + band / 2}
                y={CH - 12}
                textAnchor="middle"
                fontSize={11}
                fontWeight={selected ? 700 : 400}
                fill={selected ? '#003d8d' : palette.axis}
              >
                {yr}
              </text>
              <rect
                x={CP.left + band * i}
                y={CP.top}
                width={band}
                height={plotH + 24}
                fill="transparent"
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${yr}: ${series
                  .map(s => `${s.label} ${format(s.values[i])}`)
                  .join(', ')}. Select to view this year.`}
                aria-pressed={selected}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect(yr)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(yr);
                  }
                }}
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          {series.map(s => (
            <span key={s.label} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
        {active >= 0 && (
          <p className="text-xs text-gray-700">
            <strong>{years[active]}:</strong>{' '}
            {series
              .map(s => `${s.label} ${format(s.values[active])}`)
              .join(' · ')}
            {footnote?.(active) ? ` · ${footnote(active)}` : ''}
          </p>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-primary-700">
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="text-gray-700">
                <th className="border-b border-gray-200 py-2 pr-4 text-left font-semibold">
                  Year
                </th>
                {series.map(s => (
                  <th
                    key={s.label}
                    className="border-b border-gray-200 py-2 pl-4 text-right font-semibold"
                  >
                    {s.label}
                  </th>
                ))}
                {footnote && (
                  <th className="border-b border-gray-200 py-2 pl-4 text-right font-semibold">
                    Note
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {years.map((yr, i) => (
                <tr key={yr}>
                  <td className="border-b border-gray-100 py-2 pr-4">{yr}</td>
                  {series.map(s => (
                    <td
                      key={s.label}
                      className="border-b border-gray-100 py-2 pl-4 text-right tabular-nums"
                    >
                      {format(s.values[i])}
                    </td>
                  ))}
                  {footnote && (
                    <td className="border-b border-gray-100 py-2 pl-4 text-right tabular-nums">
                      {footnote(i) ?? '—'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function PageShell<Y extends FiscalYearBase>({
  page,
  children,
}: {
  page: ReturnType<typeof useFiscalPage<Y>>;
  children: ReactNode;
}) {
  const { data } = page;
  if (!data) return null;
  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={data.content.hero.eyebrow}
          title={data.content.hero.title}
          description={data.content.hero.description}
        />
        <Intro text={data.content.intro} />
      </section>
      <div className="-mt-4">
        <Toolbar
          years={page.years}
          selected={page.selectedYear}
          onSelect={page.selectYear}
          perResident={page.perResident}
          onPerResident={page.setPerResident}
          statusOf={y => data.years.find(d => d.year === y)?.status}
        />
        {page.yearData && <PreliminaryNote year={page.yearData} />}
        <div className="space-y-12">{children}</div>
      </div>
      <TermsCard terms={data.content.terms} />
      <SourcesCard
        note={data.content.sourceNote}
        sourceLinks={data.sourceLinks}
      />
    </div>
  );
}

function section(data: FiscalPageData<FiscalYearBase>, key: string) {
  return (
    data.content.sections[key] ?? { eyebrow: '', title: '', description: '' }
  );
}

/* ------------------------------------------------------------------ */
/* Annual Regular Income and Dependencies                              */
/* ------------------------------------------------------------------ */

export function IncomeDependencyDashboard() {
  const page = useFiscalPage<AriYear>(loadIncomeDependencyData);
  const { data, yearData: y, previous, money, scale } = page;

  if (page.loading) return <LoadingState label="Loading income data..." />;
  if (!data || !y) return <LoadingState label="No income data available." />;

  const national = y.nta + y.totalOtherShares;
  const local = y.lsr + y.interestIncome;
  const nationalShare = pct(national, y.ari);
  const per100National = Math.round(nationalShare);
  const s = (k: string) => section(data, k);

  return (
    <PageShell page={page}>
      <section>
        <SectionHeading
          eyebrow={s('overview').eyebrow}
          title={`${s('overview').title}, ${y.year}`}
          description={s('overview').description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon="ri-funds-line"
            label={
              page.perResident
                ? 'Regular income per resident'
                : 'Regular income'
            }
            value={money(y.ari)}
            detail={
              <ChangeDetail
                current={y.ari}
                previous={previous?.ari}
                previousYear={previous?.year}
              />
            }
          />
          <StatTile
            icon="ri-government-line"
            label="From the national government"
            value={formatPct(nationalShare)}
            detail={`${money(national)}, mostly the National Tax Allotment`}
          />
          <StatTile
            icon="ri-store-2-line"
            label="Collected by the town"
            value={formatPct(pct(local, y.ari))}
            detail={`${money(local)} in local taxes, fees and earnings`}
          />
          <StatTile
            icon="ri-user-line"
            label="Per resident"
            value={formatPeso(y.ari / y.population)}
            detail={`Based on about ${y.population.toLocaleString('en-PH')} residents`}
          />
        </div>
        <Card className="mt-6 border-primary-100">
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Where each ₱100 of regular income came from
            </p>
            <SplitBar
              parts={[
                {
                  label: 'Collected by the town',
                  value: local,
                  color: palette.dark,
                },
                {
                  label: 'From the national government',
                  value: national,
                  color: palette.light,
                },
              ]}
            />
          </CardContent>
        </Card>
        <Summary>
          In {y.year}, out of every ₱100 of regular income, about{' '}
          <strong>₱{per100National}</strong> came from the national government
          and <strong>₱{100 - per100National}</strong> was collected by the town
          itself.
        </Summary>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('local').eyebrow}
          title={`${s('local').title}, ${y.year}`}
          description={s('local').description}
        />
        <Card className="border-primary-100">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {money(y.lsr)} collected locally
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <BreakdownList
              total={y.lsr}
              money={v => money(v)}
              items={[
                {
                  key: 'biz',
                  label: 'Business tax',
                  description: 'Tax paid by businesses operating in town',
                  value: y.businessTax,
                },
                {
                  key: 'ee',
                  label: 'Town-run businesses',
                  description:
                    'Earnings from the public market, slaughterhouse, terminals and similar facilities',
                  value: y.economicEnterprises,
                },
                {
                  key: 'reg',
                  label: 'Permit and license fees',
                  description:
                    'Fees for business permits, licenses and similar approvals',
                  value: y.regulatoryFees,
                },
                {
                  key: 'rpt',
                  label: 'Real property tax',
                  description:
                    "The town's share of tax on land and buildings (not counting the school fund)",
                  value: y.rptGeneral,
                },
                {
                  key: 'svc',
                  label: 'Service charges',
                  description:
                    'Payments for town services such as certifications and other user fees',
                  value: y.userCharges,
                },
                {
                  key: 'oth',
                  label: 'Other local taxes',
                  description: 'Other taxes collected by the town',
                  value: y.otherTaxes,
                },
              ]}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('trend').eyebrow}
          title={s('trend').title}
          description={s('trend').description}
        />
        <ChartCard title="Regular income by source">
          <YearBarChart
            years={data.years.map(d => d.year)}
            stacked
            selectedYear={y.year}
            onSelect={page.selectYear}
            format={v => (page.perResident ? formatPeso(v) : formatAxisPeso(v))}
            series={[
              {
                label: 'Collected by the town',
                color: palette.dark,
                values: data.years.map(d => scale(d.lsr + d.interestIncome, d)),
              },
              {
                label: 'From the national government',
                color: palette.light,
                values: data.years.map(d =>
                  scale(d.nta + d.totalOtherShares, d)
                ),
              },
            ]}
            footnote={i => {
              const d = data.years[i];
              return `${formatPct(pct(d.nta + d.totalOtherShares, d.ari))} from national government`;
            }}
          />
        </ChartCard>
      </section>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Statement of Receipts and Expenditures                              */
/* ------------------------------------------------------------------ */

export function StatementsReceiptsExpenditureDashboard() {
  const page = useFiscalPage<SreYear>(loadStatementReceiptsExpenditureData);
  const { data, yearData: y, previous, money, scale } = page;

  if (page.loading)
    return <LoadingState label="Loading receipts and expenditures..." />;
  if (!data || !y)
    return (
      <LoadingState label="No receipts and expenditures data available." />
    );

  const s = (k: string) => section(data, k);

  return (
    <PageShell page={page}>
      <section>
        <SectionHeading
          eyebrow={s('overview').eyebrow}
          title={`${s('overview').title}, ${y.year}`}
          description={s('overview').description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon="ri-arrow-down-circle-line"
            label="Money received"
            value={money(y.totalIncome)}
            detail={
              <ChangeDetail
                current={y.totalIncome}
                previous={previous?.totalIncome}
                previousYear={previous?.year}
              />
            }
          />
          <StatTile
            icon="ri-arrow-up-circle-line"
            label="Spent on day-to-day services"
            value={money(y.totalOperatingExpenditure)}
            detail={`${formatPct(pct(y.totalOperatingExpenditure, y.totalIncome))} of money received`}
          />
          <StatTile
            icon="ri-building-2-line"
            label="Spent on projects and equipment"
            value={money(y.capitalOutlay)}
            detail="Buildings, roads, vehicles and equipment"
          />
          <StatTile
            icon="ri-safe-2-line"
            label="Cash at year end"
            value={money(y.cashEnd)}
            detail="Left in the town's funds after all payments"
          />
        </div>
        <Summary>
          In {y.year}, the town received <strong>{money(y.totalIncome)}</strong>{' '}
          and spent <strong>{money(y.totalOperatingExpenditure)}</strong> on
          day-to-day services, leaving{' '}
          <strong>{money(y.netOperatingIncome)}</strong>. It also spent{' '}
          <strong>{money(y.capitalOutlay)}</strong> on projects and equipment.
        </Summary>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('moneyInOut').eyebrow}
          title={`${s('moneyInOut').title}, ${y.year}`}
          description={s('moneyInOut').description}
        />
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="space-y-4 bg-stone-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {s('income').title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {money(y.totalIncome)} received
                </p>
              </div>
              <SplitBar
                parts={[
                  {
                    label: 'Collected by the town',
                    value: y.totalLocal,
                    color: palette.dark,
                  },
                  {
                    label: 'From outside sources',
                    value: y.totalExternal,
                    color: palette.light,
                  },
                ]}
              />
            </CardHeader>
            <CardContent className="p-0">
              <BreakdownList
                total={y.totalIncome}
                money={v => money(v)}
                items={[
                  {
                    key: 'nta',
                    label: 'National Tax Allotment',
                    description: "The town's share of national taxes",
                    value: y.nta,
                  },
                  { key: 'biz', label: 'Business tax', value: y.businessTax },
                  {
                    key: 'rpt',
                    label: 'Real property tax',
                    description: 'Includes the 1% for the school fund',
                    value: y.rptTotal,
                  },
                  {
                    key: 'ee',
                    label: 'Town-run businesses',
                    description:
                      'Public market, slaughterhouse and similar facilities',
                    value: y.economicEnterprises,
                  },
                  {
                    key: 'reg',
                    label: 'Permit and license fees',
                    value: y.regulatoryFees,
                  },
                  {
                    key: 'il',
                    label: 'Transfers from other governments',
                    description:
                      'Money from the province or other local governments',
                    value: y.interLocalTransfers,
                  },
                  {
                    key: 'ga',
                    label: 'Grants and aid',
                    description: 'One-time grants, donations and assistance',
                    value: y.grantsAndAid,
                  },
                  {
                    key: 'oth',
                    label: 'Other local taxes',
                    value: y.otherTaxes,
                  },
                  {
                    key: 'svc',
                    label: 'Service charges',
                    value: y.userCharges,
                  },
                  {
                    key: 'or',
                    label: 'Other receipts',
                    value: y.otherReceipts,
                  },
                  {
                    key: 'ons',
                    label: 'Other shares of national taxes',
                    description: 'For example, from PAGCOR, PCSO and lotto',
                    value: y.otherNationalShares,
                  },
                ]}
              />
            </CardContent>
          </Card>
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {s('spending').title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {money(y.totalOperatingExpenditure)} on day-to-day services,
                plus {money(y.capitalOutlay)} on projects and equipment
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <BreakdownList
                total={y.totalOperatingExpenditure}
                money={v => money(v)}
                color={palette.dark}
                items={[
                  {
                    key: 'gps',
                    label: 'Running the town government',
                    description:
                      "Mayor's office, council, treasury, assessor and other offices",
                    value: y.generalPublicServices,
                  },
                  {
                    key: 'hea',
                    label: 'Health and nutrition',
                    value: y.health,
                  },
                  {
                    key: 'sw',
                    label: 'Social welfare',
                    description:
                      'Assistance for families, seniors, persons with disability and others',
                    value: y.socialWelfare,
                  },
                  {
                    key: 'eco',
                    label: 'Livelihood and the local economy',
                    description:
                      'Agriculture, fisheries, markets and engineering',
                    value: y.economicServices,
                  },
                  {
                    key: 'edu',
                    label: 'Education, culture and sports',
                    description: 'Mostly paid from the Special Education Fund',
                    value: y.education,
                  },
                  {
                    key: 'hou',
                    label: 'Housing and community development',
                    value: y.housing,
                  },
                  { key: 'lab', label: 'Labor and employment', value: y.labor },
                  {
                    key: 'int',
                    label: 'Interest on loans',
                    value: y.debtInterest,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('trend').eyebrow}
          title={s('trend').title}
          description={s('trend').description}
        />
        <ChartCard title="Money received vs. spent on day-to-day services">
          <YearBarChart
            years={data.years.map(d => d.year)}
            selectedYear={y.year}
            onSelect={page.selectYear}
            format={v => (page.perResident ? formatPeso(v) : formatAxisPeso(v))}
            series={[
              {
                label: 'Money received',
                color: palette.light,
                values: data.years.map(d => scale(d.totalIncome, d)),
              },
              {
                label: 'Day-to-day spending',
                color: palette.dark,
                values: data.years.map(d =>
                  scale(d.totalOperatingExpenditure, d)
                ),
              },
            ]}
            footnote={i => {
              const d = data.years[i];
              return `${money(d.netOperatingIncome, d)} left over`;
            }}
          />
        </ChartCard>
      </section>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Disaster fund (LDRRMF)                                              */
/* ------------------------------------------------------------------ */

export function DisasterRiskReductionDashboard() {
  const page = useFiscalPage<DrrmYear>(loadDisasterRiskReductionData);
  const { data, yearData: y, previous, money, scale } = page;

  if (page.loading)
    return <LoadingState label="Loading disaster fund data..." />;
  if (!data || !y)
    return <LoadingState label="No disaster fund data available." />;

  const s = (k: string) => section(data, k);
  const share = pct(y.totalSpent, y.totalBudget);

  return (
    <PageShell page={page}>
      <section>
        <SectionHeading
          eyebrow={s('overview').eyebrow}
          title={`${s('overview').title}, ${y.year}`}
          description={s('overview').description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon="ri-shield-check-line"
            label="Set aside"
            value={money(y.totalBudget)}
            detail={
              <ChangeDetail
                current={y.totalBudget}
                previous={previous?.totalBudget}
                previousYear={previous?.year}
              />
            }
          />
          <StatTile
            icon="ri-funds-box-line"
            label="Spent"
            value={money(y.totalSpent)}
            detail="Charged to the disaster fund this year"
          />
          <StatTile
            icon="ri-pie-chart-2-line"
            label="Share spent"
            value={formatPct(share)}
            detail="Of the money set aside for the year"
          />
          <StatTile
            icon="ri-safe-line"
            label="Not spent this year"
            value={money(Math.max(y.totalBudget - y.totalSpent, 0))}
            detail="Kept in a trust fund for disaster use"
          />
        </div>
        <Summary>
          In {y.year}, the town set aside{' '}
          <strong>{money(y.totalBudget)}</strong> for disasters and spent{' '}
          <strong>{money(y.totalSpent)}</strong>, or{' '}
          <strong>{formatPct(share)}</strong>.
          {y.qrfSpent === 0 &&
            ' None of the Quick Response Fund was used that year.'}
        </Summary>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('parts').eyebrow}
          title={`${s('parts').title}, ${y.year}`}
          description={s('parts').description}
        />
        <Card className="border-primary-100">
          <CardContent className="space-y-6 p-6">
            <ProgressRow
              label="Preparedness fund (70%)"
              description="Training, equipment, early warning, drills and other work to reduce disaster risks"
              budget={y.mitigationBudget}
              spent={y.mitigationSpent}
              money={v => money(v)}
            />
            <ProgressRow
              label="Quick Response Fund (30%)"
              description="Kept ready for relief and recovery when a disaster strikes"
              budget={y.qrfBudget}
              spent={y.qrfSpent}
              money={v => money(v)}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('trend').eyebrow}
          title={s('trend').title}
          description={s('trend').description}
        />
        <ChartCard title="Disaster fund set aside vs. spent">
          <YearBarChart
            years={data.years.map(d => d.year)}
            selectedYear={y.year}
            onSelect={page.selectYear}
            format={v => (page.perResident ? formatPeso(v) : formatAxisPeso(v))}
            series={[
              {
                label: 'Set aside',
                color: palette.light,
                values: data.years.map(d => scale(d.totalBudget, d)),
              },
              {
                label: 'Spent',
                color: palette.dark,
                values: data.years.map(d => scale(d.totalSpent, d)),
              },
            ]}
            footnote={i => {
              const d = data.years[i];
              return `${formatPct(pct(d.totalSpent, d.totalBudget))} spent`;
            }}
          />
        </ChartCard>
      </section>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* Special Education Fund                                              */
/* ------------------------------------------------------------------ */

export function SpecialEducationFundDashboard() {
  const page = useFiscalPage<SefYear>(loadSpecialEducationFundData);
  const { data, yearData: y, previous, money, scale } = page;

  if (page.loading) return <LoadingState label="Loading school fund data..." />;
  if (!data || !y)
    return <LoadingState label="No school fund data available." />;

  const s = (k: string) => section(data, k);
  const share = pct(y.spent, y.collected);
  const notYetReported = y.status === 'preliminary' && y.spent === 0;

  return (
    <PageShell page={page}>
      <section>
        <SectionHeading
          eyebrow={s('overview').eyebrow}
          title={`${s('overview').title}, ${y.year}`}
          description={s('overview').description}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            icon="ri-book-open-line"
            label="Collected"
            value={money(y.collected)}
            detail={
              <ChangeDetail
                current={y.collected}
                previous={previous?.collected}
                previousYear={previous?.year}
              />
            }
          />
          <StatTile
            icon="ri-graduation-cap-line"
            label="Spent"
            value={notYetReported ? 'Not yet reported' : money(y.spent)}
            valueClassName={notYetReported ? 'font-sans' : undefined}
            detail="Paid from the school fund this year"
          />
          <StatTile
            icon="ri-pie-chart-2-line"
            label="Share spent"
            value={notYetReported ? '—' : formatPct(share)}
            detail={
              share > 100
                ? 'More than collected, using money saved from earlier years'
                : 'Of the money collected that year'
            }
          />
          <StatTile
            icon="ri-safe-line"
            label={
              y.spent > y.collected
                ? 'Drawn from savings'
                : 'Not spent this year'
            }
            value={
              notYetReported ? '—' : money(Math.abs(y.collected - y.spent))
            }
            detail={
              y.spent > y.collected
                ? 'Extra spending covered by the fund balance'
                : 'Stays in the fund for later use'
            }
          />
        </div>
        <Summary>
          {notYetReported ? (
            <>
              In {y.year}, the town collected{' '}
              <strong>{money(y.collected)}</strong> for the school fund. No
              spending has been reported yet in the preliminary figures.
            </>
          ) : (
            <>
              In {y.year}, the town collected{' '}
              <strong>{money(y.collected)}</strong> for the school fund and
              spent <strong>{money(y.spent)}</strong> ({formatPct(share)} of
              what was collected).
            </>
          )}
        </Summary>
      </section>

      <section>
        <SectionHeading
          eyebrow={s('trend').eyebrow}
          title={s('trend').title}
          description={s('trend').description}
        />
        <ChartCard title="School fund collected vs. spent">
          <YearBarChart
            years={data.years.map(d => d.year)}
            selectedYear={y.year}
            onSelect={page.selectYear}
            format={v => (page.perResident ? formatPeso(v) : formatAxisPeso(v))}
            series={[
              {
                label: 'Collected',
                color: palette.light,
                values: data.years.map(d => scale(d.collected, d)),
              },
              {
                label: 'Spent',
                color: palette.dark,
                values: data.years.map(d => scale(d.spent, d)),
              },
            ]}
            footnote={i => {
              const d = data.years[i];
              if (d.status === 'preliminary' && d.spent === 0)
                return 'spending not yet reported';
              return `${formatPct(pct(d.spent, d.collected))} spent`;
            }}
          />
        </ChartCard>
      </section>
    </PageShell>
  );
}
