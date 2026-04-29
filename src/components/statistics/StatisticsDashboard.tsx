import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { cn } from '../../lib/utils';
import {
  loadCompetitivenessData,
  loadDemographicsData,
  type GrowthInterval,
  type HighlightStat,
  type PillarScore,
  type PopulationPoint,
  type SourceLink,
  type StatisticsData,
} from '../../lib/dataLoader';

const toneClasses: Record<string, string> = {
  primary: 'border-primary-100 bg-primary-50 text-primary-700',
  success: 'border-success-100 bg-success-50 text-success-700',
  accent: 'border-accent-100 bg-accent-50 text-accent-700',
  secondary: 'border-secondary-100 bg-secondary-50 text-secondary-700',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-PH').format(value);
}

function formatScore(value: number) {
  return value.toFixed(4);
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 max-w-3xl">
      <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
        {eyebrow}
      </p>
      <Heading level={2} className="mb-2 text-2xl md:text-3xl">
        {title}
      </Heading>
      <Text className="text-gray-600">{description}</Text>
    </div>
  );
}

function HighlightCard({ stat }: { stat: HighlightStat }) {
  return (
    <Card
      hoverable
      className={cn('h-full border-primary-100', toneClasses[stat.tone])}
    >
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold leading-none text-gray-900">
              {stat.value}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary-700 shadow-sm"
          >
            <i className={cn(stat.icon, 'text-xl')} />
          </span>
        </div>
        <p className="mt-auto text-sm leading-relaxed text-gray-600">
          {stat.detail}
        </p>
      </CardContent>
    </Card>
  );
}

function Bar({
  value,
  max,
  className,
  minWidth = 2,
}: {
  value: number;
  max: number;
  className: string;
  minWidth?: number;
}) {
  const width =
    max > 0 && value > 0 ? Math.max((value / max) * 100, minWidth) : 0;

  return (
    <div className="h-2 overflow-hidden rounded-sm bg-gray-100">
      <div
        className={cn('h-full rounded-sm', className)}
        style={{ width: `${Math.min(width, 100)}%` }}
      />
    </div>
  );
}

function PopulationTrendChart({
  populationTrend,
}: {
  populationTrend: PopulationPoint[];
}) {
  const maxPopulation = Math.max(
    ...populationTrend.map(item => item.population)
  );
  const minPopulation = Math.min(
    ...populationTrend.map(item => item.population)
  );
  const width = 640;
  const height = 260;
  const paddingX = 54;
  const paddingY = 34;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const range = maxPopulation - minPopulation || 1;

  const points = populationTrend.map((item, index) => {
    const x =
      paddingX + (chartWidth / (populationTrend.length - 1 || 1)) * index;
    const y =
      paddingY +
      chartHeight -
      ((item.population - minPopulation) / range) * chartHeight;

    return { ...item, x, y };
  });

  return (
    <Card className="h-full overflow-hidden border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Population Trend
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Census counts from PSA datasets
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <svg
            aria-label="Population trend chart"
            className="min-w-[560px]"
            role="img"
            viewBox={`0 0 ${width} ${height}`}
          >
            <line
              stroke="#dee2e6"
              strokeWidth="1"
              x1={paddingX}
              x2={width - paddingX}
              y1={height - paddingY}
              y2={height - paddingY}
            />
            <polyline
              fill="none"
              points={points.map(point => `${point.x},${point.y}`).join(' ')}
              stroke="#0066eb"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            {points.map(point => (
              <g key={point.year}>
                <line
                  stroke="#e9ecef"
                  strokeDasharray="4 5"
                  x1={point.x}
                  x2={point.x}
                  y1={point.y}
                  y2={height - paddingY}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill="#ffffff"
                  r="7"
                  stroke="#0066eb"
                  strokeWidth="4"
                />
                <text
                  fill="#212529"
                  fontSize="16"
                  fontWeight="700"
                  textAnchor="middle"
                  x={point.x}
                  y={point.y - 16}
                >
                  {formatNumber(point.population)}
                </text>
                <text
                  fill="#868e96"
                  fontSize="13"
                  textAnchor="middle"
                  x={point.x}
                  y={height - 8}
                >
                  {point.year}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

function GrowthChangeChart({
  growthIntervals,
}: {
  growthIntervals: GrowthInterval[];
}) {
  const maxGrowth = Math.max(
    ...growthIntervals.map(item => Math.abs(item.value))
  );

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Change Between Counts
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Percent change between PSA population counts
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {growthIntervals.map(item => {
          const width = (Math.abs(item.value) / maxGrowth) * 100;

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.detail}</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {item.value > 0 ? '+' : ''}
                  {item.value.toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-[1fr_1fr] items-center gap-2">
                <div className="h-3 overflow-hidden rounded-sm bg-gray-100">
                  {item.value < 0 && (
                    <div
                      className={cn('ml-auto h-full rounded-sm', item.tone)}
                      style={{ width: `${width}%` }}
                    />
                  )}
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-gray-100">
                  {item.value >= 0 && (
                    <div
                      className={cn('h-full rounded-sm', item.tone)}
                      style={{ width: `${width}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CmciPillarChart({ cmciPillars }: { cmciPillars: PillarScore[] }) {
  const maxPillarScore = Math.max(...cmciPillars.map(item => item.score));

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">Pillar Scores</h3>
        <p className="mt-1 text-sm text-gray-600">
          CMCI 2024 score and rank by pillar
        </p>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {cmciPillars.map(item => (
          <div key={item.pillar} className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.pillar}</p>
                <p className="text-sm text-gray-600">Rank {item.rank}</p>
              </div>
              <p className="font-semibold text-gray-900">
                {formatScore(item.score)}
              </p>
            </div>
            <Bar
              value={item.score}
              max={maxPillarScore}
              className={item.tone}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CmciRankChart({ data }: { data: StatisticsData }) {
  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">Rank Profile</h3>
        <p className="mt-1 text-sm text-gray-600">
          Lower CMCI rank numbers indicate stronger relative placement
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
        <div className="rounded-xl bg-primary-50 p-5">
          <p className="text-sm font-medium text-primary-700">Overall Rank</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {data.overallRank}
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Overall score {formatScore(data.overallScore ?? 0)}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Municipality class</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {data.municipalityClass}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CMCI population basis</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatNumber(data.cmciPopulationBasis ?? 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Sources({ sourceLinks = [] }: { sourceLinks?: SourceLink[] }) {
  if (sourceLinks.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-5">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">Sources</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {sourceLinks.map(source => (
            <li key={`${source.label}-${source.href}`}>
              <a
                className="font-medium text-primary-700 underline-offset-4 hover:underline"
                href={source.href}
                rel="noreferrer"
                target="_blank"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function LoadingState({ label }: { label: string }) {
  return <div className="rounded-sm bg-gray-50 p-6 text-gray-600">{label}</div>;
}

export function DemographicsDashboard() {
  const [data, setData] = useState<StatisticsData | null>(null);
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

  if (!data) {
    return <LoadingState label="No demographics data available." />;
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.highlightStats.map(stat => (
          <HighlightCard key={stat.label} stat={stat} />
        ))}
      </div>

      <section>
        <SectionHeading
          eyebrow="Demographics"
          title="Population and Growth"
          description="Aparri's latest PSA population count is shown alongside recent census points and count-to-count movement."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          {data.populationTrend && (
            <PopulationTrendChart populationTrend={data.populationTrend} />
          )}
          {data.growthIntervals && (
            <GrowthChangeChart growthIntervals={data.growthIntervals} />
          )}
        </div>
      </section>

      <Sources sourceLinks={data.sourceLinks} />
    </div>
  );
}

export function CompetitivenessDashboard() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompetitivenessData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading competitiveness data..." />;
  }

  if (!data) {
    return <LoadingState label="No competitiveness data available." />;
  }

  return (
    <div className="space-y-12">
      {data.highlightStats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.highlightStats.map(stat => (
            <HighlightCard key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      <section>
        <SectionHeading
          eyebrow="Competitiveness"
          title="CMCI 2024 Performance"
          description="The Cities and Municipalities Competitiveness Index scores LGUs across economic dynamism, government efficiency, infrastructure, resiliency, and innovation."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <CmciRankChart data={data} />
          {data.cmciPillars && (
            <CmciPillarChart cmciPillars={data.cmciPillars} />
          )}
        </div>
      </section>

      <Sources sourceLinks={data.sourceLinks} />
    </div>
  );
}
