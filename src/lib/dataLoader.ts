/**
 * Utility to load JSON data for statistics and transparency pages
 */

export interface StatisticsData {
  highlightStats: HighlightStat[];
  populationTrend?: PopulationPoint[];
  growthIntervals?: GrowthInterval[];
  cmciPillars?: PillarScore[];
  overallRank?: string;
  overallScore?: number;
  municipalityClass?: string;
  cmciPopulationBasis?: number;
  sourceLinks?: SourceLink[];
}

export interface TransparencyData {
  highlightStats: HighlightStat[];
  revenueSources?: RevenueSource[];
  localRevenueBreakdown?: RevenueLine[];
  taxRevenueLines?: RevenueLine[];
  nonTaxRevenueLines?: RevenueLine[];
  q1IncomeSources?: RevenueSource[];
  q1ExpenditureSources?: RevenueSource[];
  q1FundPosition?: RevenueLine[];
  q1LocalSourceBreakdown?: RevenueLine[];
  q1SocialServicesBreakdown?: RevenueLine[];
  ldrrmfSources?: DisasterFund[];
  sourceLinks?: SourceLink[];
}

export interface HighlightStat {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone: string;
}

export interface PopulationPoint {
  year: string;
  label: string;
  population: number;
}

export interface GrowthInterval {
  label: string;
  value: number;
  detail: string;
  tone: string;
}

export interface PillarScore {
  pillar: string;
  rank: string;
  score: number;
  tone: string;
}

export interface SourceLink {
  label: string;
  href: string;
}

export interface RevenueSource {
  label: string;
  value: number;
  percent: number;
  tone: string;
  color: string;
}

export interface RevenueLine {
  label: string;
  value: number;
  detail: string;
  tone?: string;
}

export interface DisasterFund {
  label: string;
  appropriation: number;
  expenditure: number;
  utilization: number;
  tone: string;
}

/**
 * Load demographics data from JSON file
 */
export async function loadDemographicsData(): Promise<StatisticsData> {
  try {
    const module =
      await import('../../content/government/statistics/demographics/demographics.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load demographics data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load competitiveness data from JSON file
 */
export async function loadCompetitivenessData(): Promise<StatisticsData> {
  try {
    const module =
      await import('../../content/government/statistics/competitiveness/competitiveness.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load competitiveness data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load income and dependency data from JSON file
 */
export async function loadIncomeDependencyData(): Promise<TransparencyData> {
  try {
    const module =
      await import('../../content/government/transparency/income-and-dependency/income-and-dependency.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load income dependency data:', error);
    return { highlightStats: [] };
  }
}

/**
 * Load local financial data from JSON file
 */
export async function loadLocalFinancialData(): Promise<TransparencyData> {
  try {
    const module =
      await import('../../content/government/transparency/local-financial-data/local-financial-data.json');
    return module.default;
  } catch (error) {
    console.error('Failed to load local financial data:', error);
    return { highlightStats: [] };
  }
}
