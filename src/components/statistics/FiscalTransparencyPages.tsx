import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { cn } from '../../lib/utils';
import {
  loadIncomeDependencyData,
  loadLocalFinancialData,
  type RevenueLine,
  type RevenueSource,
  type SourceLink,
  type TransparencyData,
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
  chartLabel?: string;
  appropriationLabel?: string;
  expenditureLabel?: string;
};

type IncomeDependencyContent = {
  hero: PageHeroContent;
  guidance: PageGuidanceContent;
  sections: {
    revenueComposition: SectionContent;
    localCollections: SectionContent;
  };
  cards: {
    annualRegularIncome: CardContentText;
    localRevenueMix: CardContentText;
    taxRevenue: CardContentText;
    nonTaxRevenue: CardContentText;
  };
  terms: Term[];
  sourceNote: string;
};

type LocalFinancialContent = {
  hero: PageHeroContent;
  guidance: PageGuidanceContent;
  sections: {
    receiptsAndExpenditures: SectionContent;
    disasterRiskReduction: SectionContent;
  };
  cards: {
    operatingPosition: CardContentText;
    incomeSources: CardContentText;
    operatingExpenditures: CardContentText;
    q1IncomeDetails: CardContentText;
    socialServicesDetails: CardContentText;
    totalUtilization: CardContentText;
    fundComponents: CardContentText;
  };
  terms: Term[];
  sourceNote: string;
};

type IncomeDependencyData = TransparencyData & {
  content?: IncomeDependencyContent;
};

type LocalFinancialData = TransparencyData & {
  content?: LocalFinancialContent;
};

function formatPhpMillions(value: number) {
  return `PHP ${value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}M`;
}

function formatPhp(value: number) {
  return `PHP ${value.toLocaleString('en-PH', {
    maximumFractionDigits: 0,
  })}`;
}

function formatPercent(value: number) {
  return `${value.toLocaleString('en-PH', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function findStat(data: TransparencyData, label: string) {
  return data.highlightStats.find(stat =>
    stat.label.toLowerCase().includes(label.toLowerCase())
  );
}

function maxRevenueValue(items: RevenueLine[]) {
  return Math.max(...items.map(item => item.value), 1);
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

function LoadingState({ label }: { label: string }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6 text-sm text-gray-600">
        Loading {label}...
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6 text-sm text-gray-600">
        No fiscal data is available for this page yet.
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-2 text-2xl font-bold leading-tight text-gray-900">
              {value}
            </p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <i className={cn(icon, 'text-xl')} aria-hidden="true" />
          </span>
        </div>
        <p className="mt-auto text-sm leading-relaxed text-gray-600">
          {detail}
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

function StackedBar({ sources }: { sources: RevenueSource[] }) {
  return (
    <>
      <div className="flex h-4 overflow-hidden rounded-sm bg-gray-100">
        {sources.map(source => (
          <div
            key={source.label}
            className={source.tone}
            style={{ width: `${Math.max(source.percent, 0.6)}%` }}
            title={`${source.label}: ${formatPercent(source.percent)}`}
          />
        ))}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {sources.map(source => (
          <div key={source.label} className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn('h-3 w-3 rounded-sm', source.tone)}
              />
              <p className="text-sm font-medium text-gray-700">
                {source.label}
              </p>
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {formatPhpMillions(source.value)}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {formatPercent(source.percent)}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function DonutChart({
  sources,
  value,
  label,
}: {
  sources: RevenueSource[];
  value: string;
  label: string;
}) {
  const total = sources.reduce((sum, source) => sum + source.percent, 0) || 1;
  let cursor = 0;
  const gradient = sources
    .map(source => {
      const start = cursor;
      const end = cursor + (source.percent / total) * 100;
      cursor = end;
      return `${source.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
      <div
        aria-label={`${label} chart`}
        className="relative mx-auto h-52 w-52 rounded-full"
        role="img"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="space-y-4">
        {sources.map(source => (
          <div key={source.label} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn('mt-1 h-3 w-3 rounded-sm', source.tone)}
            />
            <div>
              <p className="font-medium text-gray-900">{source.label}</p>
              <p className="text-sm text-gray-600">
                {formatPhpMillions(source.value)} -{' '}
                {formatPercent(source.percent)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarList({
  items,
  valueFormatter = formatPhpMillions,
}: {
  items: RevenueLine[];
  max: number;
  valueFormatter?: (value: number) => string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-5">
      {items.map(item => {
        const width =
          total > 0 && item.value > 0
            ? Math.max((item.value / total) * 100, 2)
            : 0;

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.detail}</p>
              </div>
              <p className="font-semibold text-gray-900">
                {valueFormatter(item.value)}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  'h-full rounded-full',
                  item.tone ?? 'bg-primary-500'
                )}
                style={{ width: `${width}%` }}
                title={`${item.label}: ${formatPercent(width)}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OperatingComparisonChart({ items }: { items: RevenueLine[] }) {
  const chartItems = items.slice(0, 3);
  const max = maxRevenueValue(chartItems);

  return (
    <div className="flex h-64 items-end gap-5 border-b border-gray-200 px-2 pt-6">
      {chartItems.map(item => (
        <div key={item.label} className="flex flex-1 flex-col items-center">
          <div
            className={cn('w-full rounded-t-sm', item.tone ?? 'bg-primary-500')}
            style={{ height: `${Math.max((item.value / max) * 190, 8)}px` }}
          />
          <p className="mt-3 text-center text-sm font-semibold text-gray-900">
            {formatPhpMillions(item.value)}
          </p>
          <p className="mt-1 text-center text-xs text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function UtilizationGauge({ utilization }: { utilization: number }) {
  const usedDegrees = (utilization / 100) * 360;

  return (
    <div
      aria-label="LDRRMF utilization chart"
      className="relative mx-auto h-52 w-52 rounded-full"
      role="img"
      style={{
        background: `conic-gradient(#0066eb ${usedDegrees}deg, #e9ecef ${usedDegrees}deg 360deg)`,
      }}
    >
      <div className="absolute inset-10 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
        <p className="text-sm font-medium text-gray-600">Utilized</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {formatPercent(utilization)}
        </p>
      </div>
    </div>
  );
}

function SourcesCard({
  sourceLinks = [],
  note,
}: {
  sourceLinks?: SourceLink[];
  note: string;
}) {
  const links =
    sourceLinks.length > 0
      ? sourceLinks
      : [
          {
            label: 'BLGF LGU Fiscal Data',
            href: 'https://blgf.gov.ph/lgu-fiscal-data/',
          },
        ];

  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Sources and Update Notes
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{note}</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          {links.map(link => (
            <li key={`${link.label}-${link.href}`}>
              {link.href ? (
                <a
                  className="font-medium text-primary-700 underline-offset-4 hover:underline"
                  href={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ) : (
                <span className="font-medium">{link.label}</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const incomeDependencyFallbackContent: IncomeDependencyContent = {
  hero: {
    eyebrow: 'Transparency',
    title: 'Income and Dependency',
    description:
      "This page explains where Aparri's regular income came from in FY 2024 and how much of it depended on national tax transfers.",
  },
  guidance: {
    title: 'What You Need to Know',
    description: 'A quick reading table for the main FY 2024 income figures.',
  },
  sections: {
    revenueComposition: {
      eyebrow: 'Revenue Composition',
      title: 'Where the FY 2024 Income Came From',
      description:
        "The charts show the share of national transfers and local collections in Aparri's annual regular income.",
    },
    localCollections: {
      eyebrow: 'Local Collections',
      title: 'Tax and Non-Tax Revenue Details',
      description:
        "These details show which local collections contributed most to Aparri's own-source revenue.",
    },
  },
  cards: {
    annualRegularIncome: {
      title: 'Annual Regular Income',
      description: 'Share of FY 2024 annual regular income by source',
      chartLabel: 'ARI',
    },
    localRevenueMix: {
      title: 'Local Revenue Mix',
      description: 'Tax and non-tax components of locally sourced revenue',
    },
    taxRevenue: {
      title: 'Tax Revenue',
    },
    nonTaxRevenue: {
      title: 'Non-Tax Revenue',
    },
  },
  terms: [
    {
      term: 'Annual Regular Income',
      description:
        'The regular income available to the local government during the fiscal year, excluding one-time or special receipts.',
    },
    {
      term: 'Locally Sourced Revenue',
      description:
        'Revenue raised within Aparri, such as local taxes, permits, fees, service charges, and local economic enterprise income.',
    },
    {
      term: 'National Tax Allotment',
      description:
        'The share of national taxes released to local governments. It is often the largest income source for municipalities.',
    },
    {
      term: 'Dependency',
      description:
        'The share of income that comes from outside local collections. It helps show how much the budget relies on national transfers.',
    },
  ],
  sourceNote:
    'Figures are presented for public information and should be checked against the latest BLGF posting before formal use.',
};

const localFinancialFallbackContent: LocalFinancialContent = {
  hero: {
    eyebrow: 'Transparency',
    title: 'Local Financial Data',
    description:
      "This page summarizes Aparri's Q1 FY 2025 statement of receipts and expenditures and its FY 2024 disaster risk reduction fund data.",
  },
  guidance: {
    title: 'What You Need to Know',
    description:
      'A plain-language summary of the financial report shown below.',
  },
  sections: {
    receiptsAndExpenditures: {
      eyebrow: 'Receipts and Expenditures',
      title: 'FY 2025 Q1 Financial Position',
      description:
        "These charts show the quarter's income sources, spending categories, and operating result.",
    },
    disasterRiskReduction: {
      eyebrow: 'Disaster Risk Reduction',
      title: 'LDRRMF Utilization (FY 2024)',
      description:
        'The Local Disaster Risk Reduction and Management Fund data shows how much was appropriated and spent for disaster preparedness and quick response.',
    },
  },
  cards: {
    operatingPosition: {
      title: 'Operating Position',
      description: 'Income, expenditures, and net operating income',
    },
    incomeSources: {
      title: 'Income Sources',
      description: 'Share of Q1 current operating income',
      chartLabel: 'Q1 Income',
    },
    operatingExpenditures: {
      title: 'Operating Expenditures',
      description: 'Share of Q1 current operating expenditures',
    },
    q1IncomeDetails: {
      title: 'Q1 Income Details',
    },
    socialServicesDetails: {
      title: 'Social Services Details',
      description: 'Breakdown of the social services expenditure line',
    },
    totalUtilization: {
      title: 'Total Utilization',
      description: 'Expenditure against total appropriation',
      appropriationLabel: 'Total appropriation',
      expenditureLabel: 'Total expenditures',
    },
    fundComponents: {
      title: 'Fund Components',
      description: 'Utilization by LDRRMF component',
    },
  },
  terms: [
    {
      term: 'Statement of Receipts and Expenditures',
      description:
        'A BLGF report showing how much the local government received, spent, and retained during a reporting period.',
    },
    {
      term: 'Current Operating Income',
      description:
        'Income for regular operations, including local sources and external sources such as the National Tax Allotment.',
    },
    {
      term: 'Current Operating Expenditures',
      description:
        'Regular spending for public services, including general public services, social services, and economic services.',
    },
    {
      term: 'LDRRMF',
      description:
        'The local disaster fund. The 70% portion supports preparedness and prevention, while the 30% Quick Response Fund supports urgent response needs.',
    },
  ],
  sourceNote:
    'Quarterly and LDRRMF figures are based on BLGF fiscal data files. Values should be reviewed against the latest BLGF release before formal citation.',
};

export function IncomeDependencyDashboard() {
  const [data, setData] = useState<IncomeDependencyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncomeDependencyData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="income and dependency data" />;
  }

  if (!data) {
    return <EmptyState />;
  }

  const content = data.content ?? incomeDependencyFallbackContent;
  const revenueSources = data.revenueSources || [];
  const localRevenueBreakdown = data.localRevenueBreakdown || [];
  const taxRevenueLines = data.taxRevenueLines || [];
  const nonTaxRevenueLines = data.nonTaxRevenueLines || [];
  const annualIncome = findStat(data, 'Annual Regular Income');
  const ntaDependency = findStat(data, 'NTA Dependency');
  const localRevenue = revenueSources.find(source =>
    source.label.toLowerCase().includes('locally')
  );
  const largestSource = revenueSources.reduce(
    (largest, source) => (source.value > largest.value ? source : largest),
    revenueSources[0]
  );
  const localRevenueTotal = localRevenueBreakdown.reduce(
    (sum, item) => sum + item.value,
    0
  );
  const localRevenueMix = localRevenueBreakdown.slice(0, 2).map(item => ({
    label: item.label,
    value: item.value,
    percent: localRevenueTotal > 0 ? (item.value / localRevenueTotal) * 100 : 0,
    tone: item.tone ?? 'bg-primary-500',
    color: item.tone?.includes('success') ? '#00af5f' : '#0066eb',
  }));

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.description}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.highlightStats.map(stat => (
            <SummaryCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="mt-6">
          <GuidanceCard
            title={content.guidance.title}
            description={content.guidance.description}
            rows={[
              {
                label: annualIncome?.label ?? 'Annual Regular Income',
                value: annualIncome?.value ?? 'Not reported',
                detail: annualIncome?.detail,
              },
              {
                label: largestSource
                  ? 'Largest income source'
                  : 'Income source',
                value: largestSource
                  ? `${largestSource.label} (${formatPercent(
                      largestSource.percent
                    )})`
                  : 'Not reported',
                detail: largestSource
                  ? `${formatPhpMillions(
                      largestSource.value
                    )} reported in the source data.`
                  : undefined,
              },
              {
                label: localRevenue?.label ?? 'Locally Sourced Revenue',
                value: localRevenue
                  ? `${formatPhpMillions(localRevenue.value)} (${formatPercent(
                      localRevenue.percent
                    )})`
                  : 'Not reported',
                detail: localRevenue?.label
                  ? `Value and share are from the ${localRevenue.label} row.`
                  : undefined,
              },
              {
                label: ntaDependency?.label ?? 'NTA Dependency',
                value: ntaDependency?.value ?? 'Not reported',
                detail: ntaDependency?.detail,
              },
              ...data.highlightStats
                .filter(
                  stat =>
                    stat.label !== annualIncome?.label &&
                    stat.label !== ntaDependency?.label
                )
                .map(stat => ({
                  label: stat.label,
                  value: stat.value,
                  detail: stat.detail,
                })),
            ]}
          />
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={content.sections.revenueComposition.eyebrow}
          title={content.sections.revenueComposition.title}
          description={content.sections.revenueComposition.description}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.annualRegularIncome.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.annualRegularIncome.description}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <DonutChart
                label={content.cards.annualRegularIncome.chartLabel ?? 'ARI'}
                sources={revenueSources}
                value={annualIncome?.value ?? 'Not reported'}
              />
            </CardContent>
          </Card>

          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.localRevenueMix.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.localRevenueMix.description}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <StackedBar sources={localRevenueMix} />
              <div className="mt-6">
                <BarList
                  items={localRevenueBreakdown}
                  max={maxRevenueValue(localRevenueBreakdown)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow={content.sections.localCollections.eyebrow}
          title={content.sections.localCollections.title}
          description={content.sections.localCollections.description}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.taxRevenue.title}
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <BarList
                items={taxRevenueLines}
                max={maxRevenueValue(taxRevenueLines)}
              />
            </CardContent>
          </Card>

          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.nonTaxRevenue.title}
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <BarList
                items={nonTaxRevenueLines}
                max={maxRevenueValue(nonTaxRevenueLines)}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <TermsCard terms={content.terms} />

      <SourcesCard note={content.sourceNote} sourceLinks={data.sourceLinks} />
    </div>
  );
}

export function LocalFinancialDataDashboard() {
  const [data, setData] = useState<LocalFinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocalFinancialData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="local financial data" />;
  }

  if (!data) {
    return <EmptyState />;
  }

  const content = data.content ?? localFinancialFallbackContent;
  const q1IncomeSources = data.q1IncomeSources || [];
  const q1ExpenditureSources = data.q1ExpenditureSources || [];
  const q1FundPosition = data.q1FundPosition || [];
  const q1LocalSourceBreakdown = data.q1LocalSourceBreakdown || [];
  const q1SocialServicesBreakdown = data.q1SocialServicesBreakdown || [];
  const ldrrmfSources = data.ldrrmfSources || [];

  const totalLdrrmfAppropriation = ldrrmfSources.reduce(
    (sum, source) => sum + source.appropriation,
    0
  );
  const totalLdrrmfExpenditure = ldrrmfSources.reduce(
    (sum, source) => sum + source.expenditure,
    0
  );
  const totalLdrrmfUtilization =
    totalLdrrmfAppropriation > 0
      ? (totalLdrrmfExpenditure / totalLdrrmfAppropriation) * 100
      : 0;

  return (
    <div className="space-y-12">
      <section>
        <SectionHeading
          eyebrow={content.hero.eyebrow}
          title={content.hero.title}
          description={content.hero.description}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {data.highlightStats.map(stat => (
            <SummaryCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              icon={stat.icon}
            />
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
          eyebrow={content.sections.receiptsAndExpenditures.eyebrow}
          title={content.sections.receiptsAndExpenditures.title}
          description={content.sections.receiptsAndExpenditures.description}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.operatingPosition.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.operatingPosition.description}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <OperatingComparisonChart items={q1FundPosition} />
            </CardContent>
          </Card>

          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.incomeSources.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.incomeSources.description}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <DonutChart
                label={content.cards.incomeSources.chartLabel ?? 'Q1 Income'}
                sources={q1IncomeSources}
                value={
                  findStat(data, 'Operating Income')?.value ?? 'Not reported'
                }
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.operatingExpenditures.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.operatingExpenditures.description}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <StackedBar sources={q1ExpenditureSources} />
            </CardContent>
          </Card>

          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.q1IncomeDetails.title}
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <BarList
                items={q1LocalSourceBreakdown}
                max={maxRevenueValue(q1LocalSourceBreakdown)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-primary-100">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {content.cards.socialServicesDetails.title}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {content.cards.socialServicesDetails.description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <BarList
              items={q1SocialServicesBreakdown}
              max={maxRevenueValue(q1SocialServicesBreakdown)}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow={content.sections.disasterRiskReduction.eyebrow}
          title={content.sections.disasterRiskReduction.title}
          description={content.sections.disasterRiskReduction.description}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.totalUtilization.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.totalUtilization.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <UtilizationGauge utilization={totalLdrrmfUtilization} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    {content.cards.totalUtilization.appropriationLabel}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatPhp(totalLdrrmfAppropriation)}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    {content.cards.totalUtilization.expenditureLabel}
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatPhp(totalLdrrmfExpenditure)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary-100">
            <CardHeader className="bg-stone-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {content.cards.fundComponents.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.cards.fundComponents.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {ldrrmfSources.map(source => (
                <div key={source.label} className="space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {source.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatPhp(source.expenditure)} spent from{' '}
                        {formatPhp(source.appropriation)} appropriated
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatPercent(source.utilization)}
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-sm bg-gray-100">
                    <div
                      className={cn('h-full rounded-sm', source.tone)}
                      style={{ width: `${source.utilization}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <TermsCard terms={content.terms} />

      <SourcesCard note={content.sourceNote} sourceLinks={data.sourceLinks} />
    </div>
  );
}
