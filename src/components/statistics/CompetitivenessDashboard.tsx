import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import TrendChart from '../ui/TrendChart';
import { cn } from '../../lib/utils';
import {
  loadCompetitivenessData,
  type CmciIndicatorInfo,
  type CmciPeerLgu,
  type CmciPillarInfo,
  type CmciPillarKey,
  type CmciYear,
  type CompetitivenessData,
} from '../../lib/dataLoader';
import {
  LoadingState,
  SectionHeading,
  SourcesCard,
  StatTile,
  TermsCard,
} from './StatisticsDashboard';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pillarStyles: Record<
  CmciPillarKey,
  { accent: string; border: string; soft: string; text: string }
> = {
  ed: {
    accent: 'bg-teal-500',
    border: 'border-t-teal-500',
    soft: 'bg-teal-50',
    text: 'text-teal-800',
  },
  ge: {
    accent: 'bg-amber-500',
    border: 'border-t-amber-500',
    soft: 'bg-amber-50',
    text: 'text-amber-800',
  },
  in: {
    accent: 'bg-sky-500',
    border: 'border-t-sky-500',
    soft: 'bg-sky-50',
    text: 'text-sky-800',
  },
  re: {
    accent: 'bg-rose-500',
    border: 'border-t-rose-500',
    soft: 'bg-rose-50',
    text: 'text-rose-800',
  },
  iv: {
    accent: 'bg-violet-500',
    border: 'border-t-violet-500',
    soft: 'bg-violet-50',
    text: 'text-violet-800',
  },
};

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

/** Share of towns in the category that ranked below this one. */
function aheadOfPercent(rank: number, cohortSize: number) {
  if (cohortSize <= 0) return 0;
  return Math.max(0, Math.round(((cohortSize - rank) / cohortSize) * 100));
}

function RankChange({
  current,
  previous,
  compact = false,
}: {
  current: number | null | undefined;
  previous: number | null | undefined;
  compact?: boolean;
}) {
  if (
    current === null ||
    current === undefined ||
    previous === null ||
    previous === undefined
  ) {
    return compact ? null : (
      <span className="text-xs text-gray-500">No earlier year to compare</span>
    );
  }
  const change = previous - current;
  if (change === 0) {
    return (
      <span className="text-xs font-medium text-gray-500">
        {compact ? 'same' : 'Same rank as the year before'}
      </span>
    );
  }
  const improved = change > 0;
  const places = Math.abs(change);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-semibold',
        improved ? 'text-emerald-700' : 'text-rose-700'
      )}
    >
      <span aria-hidden="true">{improved ? '▲' : '▼'}</span>
      {compact
        ? places
        : `${improved ? 'Up' : 'Down'} ${places} ${
            places === 1 ? 'place' : 'places'
          } from the year before`}
      {compact && (
        <span className="sr-only">
          {improved ? ' places up' : ' places down'}
        </span>
      )}
    </span>
  );
}

/** Tiny rank-over-time line; rank 1 at the top, nulls are gaps. */
function RankSparkline({
  years,
  ranks,
  selectedYear,
  maxRank,
  label,
}: {
  years: number[];
  ranks: (number | null)[];
  selectedYear: number;
  maxRank: number;
  label: string;
}) {
  const w = 112;
  const h = 32;
  const pad = 4;
  const x = (i: number) =>
    pad + (years.length <= 1 ? 0 : ((w - pad * 2) * i) / (years.length - 1));
  const y = (rank: number) =>
    pad + ((h - pad * 2) * (rank - 1)) / (maxRank - 1);

  const runs: string[][] = [];
  let current: string[] = [];
  ranks.forEach((r, i) => {
    if (r === null) {
      if (current.length) runs.push(current);
      current = [];
    } else {
      current.push(`${x(i)},${y(r)}`);
    }
  });
  if (current.length) runs.push(current);

  const summary = years
    .map(
      (yr, i) =>
        `${yr}: ${ranks[i] === null ? 'no data' : ordinal(ranks[i] as number)}`
    )
    .join(', ');

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={`${label} rank by year. ${summary}`}
      className="shrink-0 overflow-visible"
    >
      <line
        x1={pad}
        x2={w - pad}
        y1={h / 2}
        y2={h / 2}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
      {runs.map(run => (
        <polyline
          key={run[0]}
          points={run.join(' ')}
          fill="none"
          stroke="#66a3f3"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {ranks.map((r, i) =>
        r === null ? null : (
          <circle
            key={years[i]}
            cx={x(i)}
            cy={y(r)}
            r={years[i] === selectedYear ? 4 : 2.5}
            fill={years[i] === selectedYear ? '#003d8d' : '#66a3f3'}
            stroke="#ffffff"
            strokeWidth={1.5}
          >
            <title>
              {years[i]}: {ordinal(r)}
            </title>
          </circle>
        )
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function YearSelector({
  years,
  selected,
  onSelect,
}: {
  years: number[];
  selected: number;
  onSelect: (year: number) => void;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-6 border-b border-primary-100 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <div className="flex flex-wrap items-center gap-3">
        <span
          id="cmci-year-label"
          className="text-sm font-semibold text-gray-700"
        >
          Show results for
        </span>
        <div
          role="radiogroup"
          aria-labelledby="cmci-year-label"
          className="flex gap-1 overflow-x-auto"
        >
          {years.map(year => {
            const active = year === selected;
            return (
              <button
                key={year}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(year)}
                className={cn(
                  'min-h-[40px] rounded-md px-3 text-sm font-semibold transition',
                  active
                    ? 'bg-primary-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                )}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OverviewSection({
  data,
  yearData,
  previous,
  peerRank,
}: {
  data: CompetitivenessData;
  yearData: CmciYear;
  previous: CmciYear | undefined;
  peerRank: { position: number; total: number } | null;
}) {
  const ahead = aheadOfPercent(yearData.overallRank, yearData.cohortSize);
  const change = previous ? previous.overallRank - yearData.overallRank : null;

  let sentence = `In ${yearData.year}, ${data.lgu} ranked ${ordinal(
    yearData.overallRank
  )} out of ${yearData.cohortSize} ${data.categoryPlain} in the country, placing it ahead of ${ahead}% of them.`;
  if (change !== null && previous) {
    sentence +=
      change > 0
        ? ` That is ${change} places better than in ${previous.year}.`
        : change < 0
          ? ` That is ${Math.abs(change)} places lower than in ${previous.year}.`
          : ` That is the same rank as in ${previous.year}.`;
  }
  if (peerRank) {
    sentence += ` Among ${peerRank.total} ${data.peerGroupLabel} (including ${data.lgu}), it placed ${ordinal(
      peerRank.position
    )}.`;
  }

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.overview.eyebrow}
        title={`${data.content.sections.overview.title} in ${yearData.year}`}
        description={data.content.sections.overview.description}
      />
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2',
          peerRank ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
        )}
      >
        <StatTile
          icon="ri-trophy-line"
          label="Overall rank"
          value={ordinal(yearData.overallRank)}
          detail={`out of ${yearData.cohortSize} ${data.categoryPlain}`}
        />
        <StatTile
          icon="ri-bar-chart-horizontal-line"
          label="Ahead of"
          value={`${ahead}%`}
          detail="of similar towns nationwide"
        />
        <StatTile
          icon="ri-arrow-up-down-line"
          label={previous ? `Change since ${previous.year}` : 'Change'}
          value={
            change === null
              ? '—'
              : change === 0
                ? '0'
                : `${change > 0 ? '+' : '−'}${Math.abs(change)}`
          }
          detail={
            <RankChange
              current={yearData.overallRank}
              previous={previous?.overallRank}
            />
          }
        />
        {peerRank && (
          <StatTile
            icon="ri-map-pin-line"
            label="Among nearby 1st class towns"
            value={ordinal(peerRank.position)}
            detail={`out of ${peerRank.total} towns, including ${data.lgu}`}
          />
        )}
      </div>
      <p className="mt-5 rounded-lg bg-primary-50 px-5 py-4 text-base leading-relaxed text-primary-900">
        {sentence}
        {yearData.overallScore !== null && (
          <>
            {' '}
            Its overall score was{' '}
            <strong>{yearData.overallScore.toFixed(2)}</strong> points.
          </>
        )}
      </p>
    </section>
  );
}

function PillarCards({
  pillarInfo,
  yearData,
  previous,
  selected,
  onSelect,
}: {
  pillarInfo: CmciPillarInfo[];
  yearData: CmciYear;
  previous: CmciYear | undefined;
  selected: CmciPillarKey | null;
  onSelect: (key: CmciPillarKey | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {pillarInfo.map(info => {
        const result = yearData.pillars.find(p => p.key === info.key);
        const prev = previous?.pillars.find(p => p.key === info.key);
        const style = pillarStyles[info.key];
        const active = selected === info.key;

        if (!result) {
          return (
            <div
              key={info.key}
              className={cn(
                'flex flex-col rounded-lg border border-t-4 border-gray-200 bg-gray-50 p-4',
                style.border
              )}
            >
              <p className="font-semibold text-gray-900">{info.plainName}</p>
              <p className="text-xs text-gray-500">{info.officialName}</p>
              <p className="mt-4 text-sm text-gray-600">
                Not yet part of the index in {yearData.year}.
              </p>
            </div>
          );
        }

        return (
          <button
            key={info.key}
            type="button"
            aria-pressed={active}
            aria-controls="cmci-pillar-detail"
            onClick={() => onSelect(active ? null : info.key)}
            className={cn(
              'flex flex-col rounded-lg border border-t-4 bg-white p-4 text-left transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500',
              style.border,
              active
                ? 'border-primary-500 ring-2 ring-primary-500'
                : 'border-primary-100'
            )}
          >
            <p className="font-semibold leading-snug text-gray-900">
              {info.plainName}
            </p>
            <p className="text-xs text-gray-500">{info.officialName}</p>
            <p className="mt-4 font-mono text-3xl font-bold leading-none text-gray-900">
              {ordinal(result.rank)}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Ahead of {aheadOfPercent(result.rank, yearData.cohortSize)}% of
              similar towns
            </p>
            <div className="mt-2">
              <RankChange
                current={result.rank}
                previous={prev?.rank}
                compact={false}
              />
            </div>
            <span
              className={cn(
                'mt-4 inline-flex items-center gap-1 text-sm font-semibold',
                active ? 'text-primary-700' : 'text-primary-600'
              )}
            >
              {active ? 'Hide the 10 measures' : 'See the 10 measures'}
              <i
                aria-hidden="true"
                className={cn(
                  active ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

type IndicatorSort = 'default' | 'best' | 'worst';

function PillarDetail({
  data,
  pillarKey,
  yearData,
  previous,
}: {
  data: CompetitivenessData;
  pillarKey: CmciPillarKey;
  yearData: CmciYear;
  previous: CmciYear | undefined;
}) {
  const [sort, setSort] = useState<IndicatorSort>('default');
  const info = data.pillarInfo.find(p => p.key === pillarKey);
  const result = yearData.pillars.find(p => p.key === pillarKey);
  const indicators = data.indicatorInfo.filter(i => i.pillar === pillarKey);
  const years = data.years.map(y => y.year);
  const maxRank = Math.max(...data.years.map(y => y.cohortSize));

  const rankFor = (y: CmciYear, key: string) =>
    y.pillars
      .find(p => p.key === pillarKey)
      ?.indicators.find(i => i.key === key)?.rank ?? null;

  const rows = indicators.map(ind => ({
    ind,
    rank: rankFor(yearData, ind.key),
    prev: previous ? rankFor(previous, ind.key) : null,
    history: data.years.map(y => rankFor(y, ind.key)),
  }));

  const sorted = [...rows].sort((a, b) => {
    if (sort === 'default') return 0;
    const ar = a.rank ?? Number.POSITIVE_INFINITY;
    const br = b.rank ?? Number.POSITIVE_INFINITY;
    return sort === 'best' ? ar - br : (b.rank ?? -1) - (a.rank ?? -1);
  });

  if (!info || !result) return null;
  const style = pillarStyles[pillarKey];
  const hasDetails = result.indicators.length > 0;

  return (
    <Card
      id="cmci-pillar-detail"
      className="mt-6 overflow-hidden border-primary-100"
    >
      <CardHeader className={cn('border-b border-primary-100', style.soft)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p
              className={cn(
                'text-xs font-semibold uppercase tracking-normal',
                style.text
              )}
            >
              {info.officialName} · {yearData.year}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-gray-900">
              {info.plainName}: {ordinal(result.rank)} of {yearData.cohortSize}
            </h3>
            <p className="mt-1 text-sm text-gray-700">{info.description}</p>
            {result.score !== null && (
              <p className="mt-1 text-sm text-gray-600">
                Score: {result.score.toFixed(2)} points, worth{' '}
                {yearData.pillarWeight}% of the overall score.
              </p>
            )}
          </div>
          {hasDetails && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Sort by
              <select
                value={sort}
                onChange={e => setSort(e.target.value as IndicatorSort)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
              >
                <option value="default">Original order</option>
                <option value="best">Best rank first</option>
                <option value="worst">Lowest rank first</option>
              </select>
            </label>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!hasDetails ? (
          <p className="p-6 text-sm text-gray-600">
            DTI did not publish the details for this area in {yearData.year}.
            Pick another year to see the 10 measures.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sorted.map(({ ind, rank, prev, history }) => (
              <IndicatorRow
                key={ind.key}
                ind={ind}
                rank={rank}
                prev={prev}
                history={history}
                years={years}
                selectedYear={yearData.year}
                maxRank={maxRank}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function IndicatorRow({
  ind,
  rank,
  prev,
  history,
  years,
  selectedYear,
  maxRank,
}: {
  ind: CmciIndicatorInfo;
  rank: number | null;
  prev: number | null;
  history: (number | null)[];
  years: number[];
  selectedYear: number;
  maxRank: number;
}) {
  return (
    <li className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-semibold text-gray-900">{ind.plainName}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-600">
          {ind.description}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Official name: {ind.officialName}
          {ind.formerNames.length > 0 &&
            ` (earlier: ${ind.formerNames.join(', ')})`}
        </p>
      </div>
      <div className="flex items-center gap-4 sm:justify-end">
        <RankSparkline
          years={years}
          ranks={history}
          selectedYear={selectedYear}
          maxRank={maxRank}
          label={ind.plainName}
        />
        <div className="w-24 text-right">
          <p className="text-lg font-bold text-gray-900">
            {rank === null ? '—' : ordinal(rank)}
          </p>
          <RankChange current={rank} previous={prev} compact />
        </div>
      </div>
    </li>
  );
}

function TrendSection({
  data,
  selectedYear,
  onSelectYear,
}: {
  data: CompetitivenessData;
  selectedYear: number;
  onSelectYear: (year: number) => void;
}) {
  const years = data.years.map(y => y.year);
  const rows: { key: string; label: string; values: (number | null)[] }[] = [
    {
      key: 'overall',
      label: 'Overall',
      values: data.years.map(y => y.overallRank),
    },
    ...data.pillarInfo.map(p => ({
      key: p.key,
      label: p.plainName,
      values: data.years.map(
        y => y.pillars.find(r => r.key === p.key)?.rank ?? null
      ),
    })),
  ];

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.trend.eyebrow}
        title={data.content.sections.trend.title}
        description={data.content.sections.trend.description}
      />
      <div className="grid gap-6">
        <Card className="border-primary-100">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Overall rank by year
            </h3>
          </CardHeader>
          <CardContent className="p-6">
            <TrendChart
              years={years}
              series={[
                {
                  label: 'Overall rank',
                  color: '#0066eb',
                  values: data.years.map(y => y.overallRank),
                },
              ]}
              unit="rank"
              invertY
              ariaLabel={`Line chart of ${data.lgu}'s overall CMCI rank by year. Rank 1 is at the top.`}
              formatValue={v => (v === 0 ? '1st' : ordinal(Math.round(v)))}
            />
          </CardContent>
        </Card>

        <Card className="border-primary-100">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Rank in each area by year
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Arrows compare with the year before. Select a year to update the
              rest of the page.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 border-b border-primary-100 bg-white px-4 py-3 text-left font-semibold text-gray-700"
                    >
                      Area
                    </th>
                    {years.map(year => (
                      <th
                        key={year}
                        scope="col"
                        className={cn(
                          'border-b border-primary-100 px-2 py-2 text-right',
                          year === selectedYear && 'bg-primary-50'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectYear(year)}
                          aria-pressed={year === selectedYear}
                          className={cn(
                            'rounded px-2 py-1 font-semibold',
                            year === selectedYear
                              ? 'text-primary-700'
                              : 'text-gray-700 hover:text-primary-700 hover:underline'
                          )}
                        >
                          {year}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.key}>
                      <th
                        scope="row"
                        className={cn(
                          'sticky left-0 border-b border-gray-100 bg-white px-4 py-3 text-left font-medium text-gray-900',
                          row.key === 'overall' && 'font-semibold'
                        )}
                      >
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={years[i]}
                          className={cn(
                            'border-b border-gray-100 px-3 py-3 text-right tabular-nums text-gray-900',
                            years[i] === selectedYear && 'bg-primary-50'
                          )}
                        >
                          {value === null ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            <>
                              <span
                                className={cn(
                                  row.key === 'overall' && 'font-semibold'
                                )}
                              >
                                {ordinal(value)}
                              </span>
                              <span className="block">
                                <RankChange
                                  current={value}
                                  previous={i > 0 ? row.values[i - 1] : null}
                                  compact
                                />
                              </span>
                            </>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

type CompareKey = 'overall' | CmciPillarKey;

function PeerSection({
  data,
  yearData,
  compare,
  onCompare,
}: {
  data: CompetitivenessData;
  yearData: CmciYear;
  compare: CompareKey;
  onCompare: (key: CompareKey) => void;
}) {
  const peers = [...data.peerComparison].sort((a, b) => b.year - a.year)[0];
  if (!peers) return null;
  const peerYearData = data.years.find(y => y.year === peers.year) ?? yearData;

  const availablePillars = data.pillarInfo.filter(p =>
    peerYearData.pillars.some(r => r.key === p.key)
  );
  const effective: CompareKey =
    compare === 'overall' || availablePillars.some(p => p.key === compare)
      ? compare
      : 'overall';

  const rankOf = (lgu: CmciPeerLgu) =>
    effective === 'overall' ? lgu.rank : (lgu.pillars[effective]?.rank ?? null);

  const list = peers.lgus
    .map(lgu => ({ lgu, rank: rankOf(lgu) }))
    .filter((x): x is { lgu: CmciPeerLgu; rank: number } => x.rank !== null)
    .sort((a, b) => a.rank - b.rank);

  const aparriIndex = list.findIndex(x => x.lgu.lgu === data.lgu);
  const compareLabel =
    effective === 'overall'
      ? 'overall rank'
      : `${data.pillarInfo.find(p => p.key === effective)?.plainName.toLowerCase()} rank`;

  return (
    <section>
      <SectionHeading
        eyebrow={data.content.sections.peers.eyebrow}
        title={`${data.content.sections.peers.title}, ${peerYearData.year}`}
        description={data.content.sections.peers.description}
      />
      <Card className="border-primary-100">
        <CardHeader className="bg-stone-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {data.lgu} is {ordinal(aparriIndex + 1)} of {list.length} by{' '}
                {compareLabel}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Longer bars mean the town placed ahead of more similar towns
                nationwide.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              Compare by
              <select
                value={effective}
                onChange={e => onCompare(e.target.value as CompareKey)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
              >
                <option value="overall">Overall</option>
                {availablePillars.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.plainName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ol className="space-y-2">
            {list.map(({ lgu, rank }, index) => {
              const isAparri = lgu.lgu === data.lgu;
              const ahead = aheadOfPercent(rank, peerYearData.cohortSize);
              return (
                <li
                  key={lgu.lgu}
                  className={cn(
                    'grid grid-cols-[1.5rem_7.5rem_1fr_4rem] items-center gap-3 rounded-md px-2 py-1.5 text-sm sm:grid-cols-[1.5rem_9rem_1fr_5rem]',
                    isAparri && 'bg-primary-50'
                  )}
                  title={`${lgu.lgu}: ${ordinal(rank)} nationwide, ahead of ${ahead}% of similar towns`}
                >
                  <span className="text-right text-xs text-gray-500">
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      'truncate',
                      isAparri
                        ? 'font-semibold text-primary-900'
                        : 'text-gray-800'
                    )}
                  >
                    {lgu.lgu}
                  </span>
                  <span className="h-3 w-full rounded-full bg-gray-100">
                    <span
                      className={cn(
                        'block h-3 rounded-full',
                        isAparri ? 'bg-primary-600' : 'bg-gray-400'
                      )}
                      style={{ width: `${Math.max(ahead, 2)}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      'text-right tabular-nums',
                      isAparri ? 'font-semibold text-gray-900' : 'text-gray-700'
                    )}
                  >
                    {ordinal(rank)}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-gray-500">
            Ranks are nationwide among {peerYearData.cohortSize}{' '}
            {data.categoryPlain}.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const PILLAR_KEYS: CmciPillarKey[] = ['ed', 'ge', 'in', 're', 'iv'];

export function CompetitivenessDashboard() {
  const [data, setData] = useState<CompetitivenessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadCompetitivenessData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(
    () => (data ? data.years.map(y => y.year).sort((a, b) => a - b) : []),
    [data]
  );
  const latestYear = years[years.length - 1];

  const yearParam = Number(searchParams.get('year'));
  const selectedYear = years.includes(yearParam) ? yearParam : latestYear;
  const pillarParam = searchParams.get('pillar') as CmciPillarKey | null;
  const selectedPillar =
    pillarParam && PILLAR_KEYS.includes(pillarParam) ? pillarParam : null;
  const compareParam = searchParams.get('compare');
  const compare: CompareKey =
    compareParam && PILLAR_KEYS.includes(compareParam as CmciPillarKey)
      ? (compareParam as CmciPillarKey)
      : 'overall';

  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  if (loading) {
    return <LoadingState label="Loading competitiveness data..." />;
  }
  if (!data || years.length === 0) {
    return <LoadingState label="No competitiveness data available." />;
  }

  const yearData = data.years.find(y => y.year === selectedYear)!;
  const previous = data.years.find(y => y.year === selectedYear - 1);
  const peerYear = data.peerComparison.find(p => p.year === selectedYear);
  const peerRank = peerYear
    ? {
        position:
          [...peerYear.lgus]
            .sort((a, b) => a.rank - b.rank)
            .findIndex(l => l.lgu === data.lgu) + 1,
        total: peerYear.lgus.length,
      }
    : null;
  const pillarAvailable =
    selectedPillar !== null &&
    yearData.pillars.some(p => p.key === selectedPillar);

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={data.content.hero.eyebrow}
          title={data.content.hero.title}
          description={data.content.hero.description}
        />
        <Card className="border-primary-100 bg-gray-50">
          <CardContent className="flex gap-4 p-5">
            <i
              aria-hidden="true"
              className="ri-information-line mt-0.5 text-xl text-primary-700"
            />
            <p className="text-sm leading-relaxed text-gray-700">
              {data.content.intro}
            </p>
          </CardContent>
        </Card>
      </section>

      <div>
        <YearSelector
          years={years}
          selected={selectedYear}
          onSelect={year =>
            updateParam('year', year === latestYear ? null : String(year))
          }
        />
        <OverviewSection
          data={data}
          yearData={yearData}
          previous={previous}
          peerRank={peerRank}
        />
      </div>

      <section>
        <SectionHeading
          eyebrow={data.content.sections.pillars.eyebrow}
          title={`${data.content.sections.pillars.title} (${yearData.year})`}
          description={data.content.sections.pillars.description}
        />
        <PillarCards
          pillarInfo={data.pillarInfo}
          yearData={yearData}
          previous={previous}
          selected={pillarAvailable ? selectedPillar : null}
          onSelect={key => updateParam('pillar', key)}
        />
        {pillarAvailable && selectedPillar && (
          <PillarDetail
            key={`${selectedPillar}-${selectedYear}`}
            data={data}
            pillarKey={selectedPillar}
            yearData={yearData}
            previous={previous}
          />
        )}
      </section>

      <PeerSection
        data={data}
        yearData={yearData}
        compare={compare}
        onCompare={key =>
          updateParam('compare', key === 'overall' ? null : key)
        }
      />

      <TrendSection
        data={data}
        selectedYear={selectedYear}
        onSelectYear={year =>
          updateParam('year', year === latestYear ? null : String(year))
        }
      />

      <TermsCard terms={data.content.terms} />

      <SourcesCard
        note={data.content.sourceNote}
        sourceLinks={data.sourceLinks}
      />
    </div>
  );
}
