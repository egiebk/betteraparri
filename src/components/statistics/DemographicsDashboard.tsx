import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import {
  loadDemographicsData,
  type BarangayPopulation,
  type DemographicsData,
  type PopulationCount,
} from '../../lib/dataLoader';
import {
  LoadingState,
  ProvenanceBar,
  SectionHeading,
  SourcesCard,
  StatTile,
  TermsCard,
} from './StatisticsDashboard';
import { GlossaryText } from '../ui/Glossary';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const colors = {
  line: '#0066eb',
  area: '#0066eb',
  grow: '#0066eb',
  shrink: '#ff4d00',
  grid: '#e5e7eb',
  axisText: '#6b7280',
};

const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-PH').format(value);
}

function formatSigned(value: number, digits = 0) {
  const abs = Math.abs(value).toLocaleString('en-PH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}

function formatCompact(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

function yearsBetween(from: string, to: string) {
  return (new Date(to).getTime() - new Date(from).getTime()) / MS_PER_YEAR;
}

/** Average yearly growth rate (%) between two census counts. */
function annualRate(from: PopulationCount, to: PopulationCount) {
  const years = yearsBetween(from.date, to.date);
  return (Math.pow(to.population / from.population, 1 / years) - 1) * 100;
}

/** Keep floating tooltips inside the chart. */
function clampPct(value: number) {
  return Math.min(Math.max(value, 14), 86);
}

function decimalYear(date: string) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1).getTime();
  return d.getFullYear() + (d.getTime() - start) / MS_PER_YEAR;
}

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

function OverviewSection({ data }: { data: DemographicsData }) {
  const history = data.populationHistory;
  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const change = latest.population - previous.population;
  const changePct = (change / previous.population) * 100;
  const rate = annualRate(previous, latest);
  const density = latest.population / data.landAreaKm2;

  const counted = data.barangays.filter(b => b.pop2024 !== null);
  const largest = [...counted].sort(
    (a, b) => (b.pop2024 ?? 0) - (a.pop2024 ?? 0)
  )[0];

  const sentence =
    change < 0
      ? `Aparri had ${formatNumber(latest.population)} residents in ${latest.year}, ${formatNumber(
          Math.abs(change)
        )} fewer than in ${previous.year}. This is the first drop between censuses since 1948.`
      : `Aparri had ${formatNumber(latest.population)} residents in ${latest.year}, ${formatNumber(
          change
        )} more than in ${previous.year}.`;

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.overview.eyebrow}
        title={data.content.sections.overview.title}
        description={data.content.sections.overview.description}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon="ri-group-line"
          label={`Population (${latest.year})`}
          value={formatNumber(latest.population)}
          detail={data.latestCensus.name}
        />
        <StatTile
          icon="ri-arrow-up-down-line"
          label={`Change since ${previous.year}`}
          value={formatSigned(change)}
          detail={`${formatSigned(changePct, 2)}% in total, or ${formatSigned(
            rate,
            2
          )}% a year on average`}
        />
        <StatTile
          icon="ri-map-2-line"
          label="People per km²"
          value={formatNumber(Math.round(density))}
          detail={`${formatNumber(data.landAreaKm2)} km² of land`}
        />
        <StatTile
          icon="ri-home-4-line"
          label="Most populous barangay"
          value={largest.name}
          valueClassName="font-sans"
          detail={`${formatNumber(largest.pop2024 ?? 0)} residents, ${(
            ((largest.pop2024 ?? 0) / latest.population) *
            100
          ).toFixed(1)}% of the town`}
        />
      </div>
      <p className="mt-5 rounded-lg bg-primary-50 px-5 py-4 text-base leading-relaxed text-primary-900">
        {sentence}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* History chart                                                       */
/* ------------------------------------------------------------------ */

type HistoryMode = 'count' | 'growth';

const W = 720;
const H = 300;
const PAD = { top: 20, right: 20, bottom: 36, left: 52 };

function HistoryChart({
  history,
  mode,
}: {
  history: PopulationCount[];
  mode: HistoryMode;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const xs = history.map(h => decimalYear(h.date));
  const minX = Math.floor(xs[0] / 10) * 10;
  const maxX = Math.ceil(xs[xs.length - 1] / 10) * 10;
  const x = (yr: number) => PAD.left + ((yr - minX) / (maxX - minX)) * plotW;
  const decades: number[] = [];
  for (let d = minX; d <= maxX; d += 20) decades.push(d);

  const intervals = history.slice(1).map((h, i) => ({
    from: history[i],
    to: h,
    rate: annualRate(history[i], h),
    change: h.population - history[i].population,
  }));

  if (mode === 'count') {
    const maxY =
      Math.ceil(Math.max(...history.map(h => h.population)) / 20000) * 20000;
    const y = (v: number) => PAD.top + plotH - (v / maxY) * plotH;
    const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * maxY);
    const points = history.map((h, i) => `${x(xs[i])},${y(h.population)}`);
    const area = `M${x(xs[0])},${y(0)} L${points.join(' L')} L${x(
      xs[xs.length - 1]
    )},${y(0)} Z`;
    const active = hover !== null ? history[hover] : null;
    const prev = hover !== null && hover > 0 ? history[hover - 1] : null;

    return (
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Line chart of Aparri's population at each census from ${history[0].year} to ${
            history[history.length - 1].year
          }.`}
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map(t => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={colors.grid}
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize={11}
                fill={colors.axisText}
              >
                {formatCompact(t)}
              </text>
            </g>
          ))}
          {decades.map(d => (
            <text
              key={d}
              x={x(d)}
              y={H - 10}
              textAnchor="middle"
              fontSize={11}
              fill={colors.axisText}
            >
              {d}
            </text>
          ))}
          <path d={area} fill={colors.area} opacity={0.08} />
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={colors.line}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hover !== null && (
            <line
              x1={x(xs[hover])}
              x2={x(xs[hover])}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="#9ca3af"
              strokeDasharray="3 3"
            />
          )}
          {history.map((h, i) => (
            <g key={h.date}>
              <circle
                cx={x(xs[i])}
                cy={y(h.population)}
                r={hover === i ? 6 : 4}
                fill={colors.line}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <circle
                cx={x(xs[i])}
                cy={y(h.population)}
                r={14}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={`${h.year}: ${formatNumber(h.population)} residents`}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-pointer focus:outline-none"
              />
            </g>
          ))}
        </svg>
        {active && (
          <div
            className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md"
            style={{
              left: `${clampPct((x(xs[hover!]) / W) * 100)}%`,
              top: `${(y(active.population) / H) * 100}%`,
              transform: 'translate(-50%, calc(-100% - 12px))',
            }}
          >
            <p className="font-semibold text-gray-900">{active.year} census</p>
            <p className="text-gray-700">
              {formatNumber(active.population)} residents
            </p>
            {prev && (
              <p className="text-gray-500">
                {formatSigned(active.population - prev.population)} since{' '}
                {prev.year}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Growth mode: one bar per census interval, spanning its years.
  const maxAbs = Math.max(...intervals.map(i => Math.abs(i.rate)));
  const limit = Math.ceil(maxAbs);
  const y = (v: number) => PAD.top + plotH / 2 - (v / limit) * (plotH / 2);
  const ticks = [-limit, -limit / 2, 0, limit / 2, limit];
  const active = hover !== null ? intervals[hover] : null;
  const tooltipLeft = active
    ? ((x(decimalYear(active.from.date)) + x(decimalYear(active.to.date))) /
        2 /
        W) *
      100
    : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Bar chart of Aparri's average yearly population growth rate between each pair of census counts."
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map(t => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? '#9ca3af' : colors.grid}
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize={11}
              fill={colors.axisText}
            >
              {formatSigned(t, t % 1 === 0 ? 0 : 1)}%
            </text>
          </g>
        ))}
        {decades.map(d => (
          <text
            key={d}
            x={x(d)}
            y={H - 10}
            textAnchor="middle"
            fontSize={11}
            fill={colors.axisText}
          >
            {d}
          </text>
        ))}
        {intervals.map((iv, i) => {
          const x0 = x(decimalYear(iv.from.date)) + 1;
          const x1 = x(decimalYear(iv.to.date)) - 1;
          const top = Math.min(y(iv.rate), y(0));
          const height = Math.max(Math.abs(y(iv.rate) - y(0)), 1);
          return (
            <rect
              key={iv.to.date}
              x={x0}
              y={top}
              width={Math.max(x1 - x0, 2)}
              height={height}
              rx={2}
              fill={iv.rate >= 0 ? colors.grow : colors.shrink}
              opacity={hover === null || hover === i ? 1 : 0.45}
              tabIndex={0}
              role="button"
              aria-label={`${iv.from.year} to ${iv.to.year}: ${formatSigned(
                iv.rate,
                2
              )}% per year`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="cursor-pointer focus:outline-none"
            />
          );
        })}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute z-10 w-52 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md"
          style={{
            left: `${clampPct(tooltipLeft)}%`,
            top: `${(Math.min(y(active.rate), y(0)) / H) * 100}%`,
            transform: 'translate(-50%, calc(-100% - 8px))',
          }}
        >
          <p className="font-semibold text-gray-900">
            {active.from.year} to {active.to.year}
          </p>
          <p className="text-gray-700">
            {formatSigned(active.rate, 2)}% per year
          </p>
          <p className="text-gray-500">
            {formatSigned(active.change)} residents overall
          </p>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: colors.grow }}
          />
          Population grew
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: colors.shrink }}
          />
          Population shrank
        </span>
      </div>
    </div>
  );
}

function HistorySection({ data }: { data: DemographicsData }) {
  const [mode, setMode] = useState<HistoryMode>('count');
  const history = data.populationHistory;
  const first = history[0];
  const latest = history[history.length - 1];
  const times = latest.population / first.population;

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.history.eyebrow}
        title={data.content.sections.history.title}
        description={data.content.sections.history.description}
      />
      <Card className="border-primary-100">
        <CardHeader className="bg-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'count'
                  ? 'Number of residents at each census'
                  : 'Average yearly growth between censuses'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {mode === 'count'
                  ? `The population grew about ${times.toFixed(1)} times, from ${formatNumber(
                      first.population
                    )} in ${first.year} to ${formatNumber(latest.population)} in ${latest.year}.`
                  : 'Each bar covers the years between two censuses. Bars below the line mean the population shrank.'}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Chart view"
              className="flex rounded-md bg-white p-1 shadow-sm"
            >
              {(
                [
                  ['count', 'Number of people'],
                  ['growth', 'Yearly growth'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={mode === key}
                  onClick={() => setMode(key)}
                  className={cn(
                    'min-h-[36px] rounded px-3 text-sm font-semibold transition',
                    mode === key
                      ? 'bg-primary-700 text-white'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <HistoryChart history={history} mode={mode} />
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-primary-700">
              View as table
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="border-b border-gray-200 py-2 pr-4 font-semibold">
                      Census
                    </th>
                    <th className="border-b border-gray-200 py-2 pr-4 text-right font-semibold">
                      Residents
                    </th>
                    <th className="border-b border-gray-200 py-2 pr-4 text-right font-semibold">
                      Change
                    </th>
                    <th className="border-b border-gray-200 py-2 text-right font-semibold">
                      Yearly growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.date}>
                      <td className="border-b border-gray-100 py-2 pr-4">
                        {new Date(h.date).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="border-b border-gray-100 py-2 pr-4 text-right tabular-nums">
                        {formatNumber(h.population)}
                      </td>
                      <td className="border-b border-gray-100 py-2 pr-4 text-right tabular-nums">
                        {i === 0
                          ? '—'
                          : formatSigned(
                              h.population - history[i - 1].population
                            )}
                      </td>
                      <td className="border-b border-gray-100 py-2 text-right tabular-nums">
                        {i === 0
                          ? '—'
                          : `${formatSigned(annualRate(history[i - 1], h), 2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </CardContent>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Barangays                                                           */
/* ------------------------------------------------------------------ */

type BarangaySortKey = 'name' | 'pop2020' | 'pop2024' | 'change' | 'changePct';

type BarangayRow = BarangayPopulation & {
  change: number | null;
  changePct: number | null;
  share: number | null;
};

function BarangaySection({ data }: { data: DemographicsData }) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<BarangaySortKey>('pop2024');
  const [ascending, setAscending] = useState(false);

  const total2024 = data.barangays.reduce((s, b) => s + (b.pop2024 ?? 0), 0);

  const rows: BarangayRow[] = useMemo(
    () =>
      data.barangays.map(b => ({
        ...b,
        change: b.pop2024 === null ? null : b.pop2024 - b.pop2020,
        changePct:
          b.pop2024 === null
            ? null
            : ((b.pop2024 - b.pop2020) / b.pop2020) * 100,
        share: b.pop2024 === null ? null : (b.pop2024 / total2024) * 100,
      })),
    [data.barangays, total2024]
  );

  const grew = rows.filter(r => (r.change ?? 0) > 0).length;
  const shrank = rows.filter(r => (r.change ?? 0) < 0).length;
  const maxShare = Math.max(...rows.map(r => r.share ?? 0));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter(r => r.name.toLowerCase().includes(q))
      : rows;
    const dir = ascending ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name, 'en', { numeric: true }) * dir;
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null) return 1;
      if (bv === null) return -1;
      return (av - bv) * dir;
    });
  }, [rows, query, sortKey, ascending]);

  const setSort = (key: BarangaySortKey) => {
    if (key === sortKey) {
      setAscending(!ascending);
    } else {
      setSortKey(key);
      setAscending(key === 'name');
    }
  };

  const SortHeader = ({
    k,
    label,
    align = 'right',
  }: {
    k: BarangaySortKey;
    label: string;
    align?: 'left' | 'right';
  }) => (
    <th
      scope="col"
      aria-sort={
        sortKey === k ? (ascending ? 'ascending' : 'descending') : 'none'
      }
      className={cn(
        'border-b border-primary-100 bg-white px-3 py-3 font-semibold text-gray-700',
        align === 'left' ? 'text-left' : 'text-right'
      )}
    >
      <button
        type="button"
        onClick={() => setSort(k)}
        className="inline-flex items-center gap-1 hover:text-primary-700"
      >
        {label}
        <i
          aria-hidden="true"
          className={cn(
            'text-xs',
            sortKey !== k
              ? 'ri-arrow-up-down-line text-gray-400'
              : ascending
                ? 'ri-arrow-up-line text-primary-700'
                : 'ri-arrow-down-line text-primary-700'
          )}
        />
      </button>
    </th>
  );

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.barangays.eyebrow}
        title={data.content.sections.barangays.title}
        description={data.content.sections.barangays.description}
      />
      <Card className="border-primary-100">
        <CardHeader className="bg-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              From 2020 to 2024,{' '}
              <strong className="text-gray-900">{grew} barangays grew</strong>{' '}
              and{' '}
              <strong className="text-gray-900">{shrank} got smaller</strong>.
            </p>
            <label className="relative w-full sm:w-64">
              <span className="sr-only">Search barangays</span>
              <i
                aria-hidden="true"
                className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search barangay"
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </label>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr>
                  <SortHeader k="name" label="Barangay" align="left" />
                  <SortHeader k="pop2020" label="2020" />
                  <SortHeader k="pop2024" label="2024" />
                  <SortHeader k="change" label="Change" />
                  <SortHeader k="changePct" label="% Change" />
                  <th
                    scope="col"
                    className="border-b border-primary-100 bg-white px-3 py-3 text-left font-semibold text-gray-700"
                  >
                    % Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map(r => (
                  <tr key={r.slug} className="hover:bg-primary-50/40">
                    <th
                      scope="row"
                      className="border-b border-gray-100 px-3 py-2.5 text-left font-medium"
                    >
                      <Link
                        to={`/government/barangays/${r.slug}`}
                        className="text-primary-700 underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                    </th>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-right tabular-nums text-gray-700">
                      {formatNumber(r.pop2020)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-right font-semibold tabular-nums text-gray-900">
                      {r.pop2024 === null ? (
                        <span className="font-normal text-gray-400">
                          Not listed
                        </span>
                      ) : (
                        formatNumber(r.pop2024)
                      )}
                    </td>
                    <td
                      className={cn(
                        'border-b border-gray-100 px-3 py-2.5 text-right tabular-nums',
                        r.change === null
                          ? 'text-gray-400'
                          : r.change > 0
                            ? 'text-emerald-700'
                            : r.change < 0
                              ? 'text-rose-700'
                              : 'text-gray-600'
                      )}
                    >
                      {r.change === null ? '—' : formatSigned(r.change)}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5 text-right tabular-nums text-gray-700">
                      {r.changePct === null
                        ? '—'
                        : `${formatSigned(r.changePct, 1)}%`}
                    </td>
                    <td className="border-b border-gray-100 px-3 py-2.5">
                      {r.share === null ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-28 rounded-full bg-gray-100">
                            <span
                              className="block h-2 rounded-full bg-primary-500"
                              style={{
                                width: `${Math.max(
                                  (r.share / maxShare) * 100,
                                  2
                                )}%`,
                              }}
                            />
                          </span>
                          <span className="tabular-nums text-gray-700">
                            {r.share.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-6 text-center text-gray-600"
                    >
                      No barangay matches “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DemographicsDashboard() {
  const [data, setData] = useState<DemographicsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemographicsData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading demographics data..." />;
  }
  if (!data || data.populationHistory.length < 2) {
    return <LoadingState label="No demographics data available." />;
  }

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={data.content.hero.eyebrow}
          title={data.content.hero.title}
          description={data.content.hero.description}
        />
        <ProvenanceBar
          provenance={data.provenance}
          coverage={`${Math.min(
            ...data.populationHistory.map(p => p.year)
          )}–${data.latestCensus.year}`}
        />
        <Card className="border-primary-100 bg-gray-50">
          <CardContent className="flex gap-4 p-5">
            <i
              aria-hidden="true"
              className="ri-information-line mt-0.5 text-xl text-primary-700"
            />
            <p className="text-sm leading-relaxed text-gray-700">
              <GlossaryText text={data.content.intro} />
            </p>
          </CardContent>
        </Card>
      </section>

      <OverviewSection data={data} />
      <HistorySection data={data} />
      <BarangaySection data={data} />

      <TermsCard terms={data.content.terms} />
      <SourcesCard
        note={data.content.sourceNote}
        sourceLinks={data.sourceLinks}
      />
    </div>
  );
}
