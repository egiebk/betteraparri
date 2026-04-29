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

type InfoRow = {
  label: string;
  value: string;
  detail?: string;
};

type Term = {
  term: string;
  description: string;
};

type PageHeroContent = {
  eyebrow: string;
  title: string;
  description: string;
};

type PageGuidanceContent = {
  title: string;
  description: string;
};

type SectionContent = {
  eyebrow: string;
  title: string;
  description: string;
};

type CardContentText = {
  title: string;
  description?: string;
};

type DemographicsContent = {
  hero: PageHeroContent;
  guidance: PageGuidanceContent;
  sections: {
    populationAndGrowth: SectionContent;
  };
  cards: {
    populationTrend: CardContentText;
    countChanges: CardContentText;
  };
  terms: Term[];
  sourceNote: string;
};

type CompetitivenessContent = {
  hero: PageHeroContent;
  guidance: PageGuidanceContent;
  sections: {
    cmciPerformance: SectionContent;
  };
  cards: {
    rankProfile: CardContentText;
    pillarScores: CardContentText;
  };
  terms: Term[];
  sourceNote: string;
};

type DemographicsData = StatisticsData & {
  content?: DemographicsContent;
};

type CompetitivenessData = StatisticsData & {
  content?: CompetitivenessContent;
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

function SummaryCard({ stat }: { stat: HighlightStat }) {
  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold leading-tight text-gray-900">
              {stat.value}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700"
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

function GuidanceCard({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: InfoRow[];
}) {
  return (
    <Card className="border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="p-0">
        <dl className="divide-y divide-gray-100">
          {rows.map(row => (
            <div
              key={row.label}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]"
            >
              <dt className="text-sm font-semibold text-gray-700">
                {row.label}
              </dt>
              <dd>
                <p className="text-sm font-semibold text-gray-900">
                  {row.value}
                </p>
                {row.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {row.detail}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
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
  content,
}: {
  populationTrend: PopulationPoint[];
  content: CardContentText;
}) {
  if (populationTrend.length === 0) {
    return null;
  }

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
        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
        {content.description && (
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
        )}
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
  content,
}: {
  growthIntervals: GrowthInterval[];
  content: CardContentText;
}) {
  if (growthIntervals.length === 0) {
    return null;
  }

  const maxGrowth = Math.max(
    ...growthIntervals.map(item => Math.abs(item.value))
  );

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
        {content.description && (
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
        )}
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

function CmciPillarChart({
  cmciPillars,
  content,
}: {
  cmciPillars: PillarScore[];
  content: CardContentText;
}) {
  if (cmciPillars.length === 0) {
    return null;
  }

  const maxPillarScore = Math.max(...cmciPillars.map(item => item.score));

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
        {content.description && (
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
        )}
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

function CmciRankChart({
  data,
  content,
}: {
  data: StatisticsData;
  content: CardContentText;
}) {
  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
        {content.description && (
          <p className="mt-1 text-sm text-gray-600">{content.description}</p>
        )}
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

function TermsCard({ terms }: { terms: Term[] }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          How to Read This Page
        </h3>
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

function SourcesCard({
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
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {sourceLinks.map(source => (
            <li key={`${source.label}-${source.href}`}>
              {source.href ? (
                <a
                  className="font-medium text-primary-700 underline-offset-4 hover:underline"
                  href={source.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {source.label}
                </a>
              ) : (
                <span className="font-medium">{source.label}</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6 text-sm text-gray-600">{label}</CardContent>
    </Card>
  );
}

const demographicsFallbackContent: DemographicsContent = {
  hero: {
    eyebrow: 'Statistics',
    title: 'Demographics',
    description:
      'Aparri population counts from PSA datasets, including recent census movement and growth indicators.',
  },
  guidance: {
    title: 'What You Need to Know',
    description: 'A plain-language summary of the demographic figures below.',
  },
  sections: {
    populationAndGrowth: {
      eyebrow: 'Population and Growth',
      title: 'Population Trend and Count Changes',
      description:
        "Aparri's latest PSA population count is shown alongside recent census points and count-to-count movement.",
    },
  },
  cards: {
    populationTrend: {
      title: 'Population Trend',
      description: 'Census counts from PSA datasets',
    },
    countChanges: {
      title: 'Change Between Counts',
      description: 'Percent change between PSA population counts',
    },
  },
  terms: [
    {
      term: 'POPCEN',
      description:
        'The Census of Population conducted by the Philippine Statistics Authority to count residents and update population benchmarks.',
    },
    {
      term: 'Annualized Growth',
      description:
        'The average yearly rate of population change between two PSA population counts.',
    },
  ],
  sourceNote:
    'Population figures are based on PSA published datasets. Update the JSON data file when PSA releases new counts or corrected tables.',
};

const competitivenessFallbackContent: CompetitivenessContent = {
  hero: {
    eyebrow: 'Statistics',
    title: 'Competitiveness',
    description:
      "Aparri's Cities and Municipalities Competitiveness Index results, including overall placement and pillar performance.",
  },
  guidance: {
    title: 'What You Need to Know',
    description:
      'A plain-language summary of the competitiveness indicators below.',
  },
  sections: {
    cmciPerformance: {
      eyebrow: 'Competitiveness',
      title: 'CMCI 2024 Performance',
      description:
        'The Cities and Municipalities Competitiveness Index scores LGUs across economic dynamism, government efficiency, infrastructure, resiliency, and innovation.',
    },
  },
  cards: {
    rankProfile: {
      title: 'Rank Profile',
      description:
        'Lower CMCI rank numbers indicate stronger relative placement',
    },
    pillarScores: {
      title: 'Pillar Scores',
      description: 'CMCI 2024 score and rank by pillar',
    },
  },
  terms: [
    {
      term: 'CMCI',
      description:
        'The Cities and Municipalities Competitiveness Index is a DTI-led ranking that compares local economies across several pillars.',
    },
    {
      term: 'Pillar Score',
      description:
        'A score for one CMCI dimension, such as economic dynamism, government efficiency, infrastructure, resiliency, or innovation.',
    },
  ],
  sourceNote:
    'CMCI figures are based on the latest source file included in this page. Update the JSON data file when DTI publishes a new profile.',
};

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

  if (!data) {
    return <LoadingState label="No demographics data available." />;
  }

  const content = data.content ?? demographicsFallbackContent;
  const populationTrend = data.populationTrend || [];
  const growthIntervals = data.growthIntervals || [];

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.description}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.highlightStats.map(stat => (
            <SummaryCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-6">
          <GuidanceCard
            title={content.guidance.title}
            description={content.guidance.description}
            rows={data.highlightStats.map(stat => ({
              label: stat.label,
              value: stat.value,
              detail: stat.detail,
            }))}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={content.sections.populationAndGrowth.eyebrow}
          title={content.sections.populationAndGrowth.title}
          description={content.sections.populationAndGrowth.description}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
          <PopulationTrendChart
            content={content.cards.populationTrend}
            populationTrend={populationTrend}
          />
          <GrowthChangeChart
            content={content.cards.countChanges}
            growthIntervals={growthIntervals}
          />
        </div>
      </section>

      <TermsCard terms={content.terms} />

      <SourcesCard note={content.sourceNote} sourceLinks={data.sourceLinks} />
    </div>
  );
}

export function CompetitivenessDashboard() {
  const [data, setData] = useState<CompetitivenessData | null>(null);
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

  const content = data.content ?? competitivenessFallbackContent;
  const cmciPillars = data.cmciPillars || [];

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.description}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.highlightStats.map(stat => (
            <SummaryCard key={stat.label} stat={stat} />
          ))}
        </div>

        <div className="mt-6">
          <GuidanceCard
            title={content.guidance.title}
            description={content.guidance.description}
            rows={[
              ...data.highlightStats.map(stat => ({
                label: stat.label,
                value: stat.value,
                detail: stat.detail,
              })),
              {
                label: 'Municipality Class',
                value: data.municipalityClass ?? 'Not reported',
                detail: data.cmciPopulationBasis
                  ? `CMCI population basis: ${formatNumber(
                      data.cmciPopulationBasis
                    )}`
                  : undefined,
              },
            ]}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={content.sections.cmciPerformance.eyebrow}
          title={content.sections.cmciPerformance.title}
          description={content.sections.cmciPerformance.description}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <CmciRankChart content={content.cards.rankProfile} data={data} />
          <CmciPillarChart
            cmciPillars={cmciPillars}
            content={content.cards.pillarScores}
          />
        </div>
      </section>

      <TermsCard terms={content.terms} />

      <SourcesCard note={content.sourceNote} sourceLinks={data.sourceLinks} />
    </div>
  );
}
