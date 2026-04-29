import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Banner } from '@bettergov/kapwa/banner';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { createMarkdownComponents } from '../lib/markdownComponents';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { getTypographyTheme } from '../lib/typographyThemes';
import {
  serviceCategories,
  governmentCategories,
  getCategorySubcategories,
  isNestedCategory,
  type Subcategory,
  type CategoryIndex,
} from '../data/yamlLoader';
import SEO from '../components/SEO';
import OfficialsDirectoryCards from '../components/officials/OfficialsDirectoryCards';
import ExecutiveOfficialsCards from '../components/officials/ExecutiveOfficialsCards';
import {
  CompetitivenessDashboard,
  DemographicsDashboard,
} from '../components/statistics/StatisticsDashboard';
import {
  IncomeDependencyDashboard,
  LocalFinancialDataDashboard,
} from '../components/statistics/FiscalTransparencyPages';

interface DocumentProps {
  theme?: string;
  categoryType?: 'service' | 'government';
}

type DashboardDocument =
  | 'demographics'
  | 'competitiveness'
  | 'income-and-dependency'
  | 'local-financial-data';

const dashboardTitles: Record<DashboardDocument, string> = {
  demographics: 'Demographics',
  competitiveness: 'Competitiveness',
  'income-and-dependency': 'Income and Dependency',
  'local-financial-data': 'Local Financial Data',
};

function getDashboardDocument(
  categoryType: DocumentProps['categoryType'],
  category: string | undefined,
  documentSlug: string | undefined
): DashboardDocument | null {
  if (categoryType !== 'government' || !category || !documentSlug) {
    return null;
  }

  if (
    category === 'statistics' &&
    (documentSlug === 'demographics' || documentSlug === 'competitiveness')
  ) {
    return documentSlug;
  }

  if (
    category === 'transparency' &&
    (documentSlug === 'income-and-dependency' ||
      documentSlug === 'local-financial-data')
  ) {
    return documentSlug;
  }

  return null;
}

function DashboardContent({ dashboard }: { dashboard: DashboardDocument }) {
  switch (dashboard) {
    case 'demographics':
      return <DemographicsDashboard />;
    case 'competitiveness':
      return <CompetitivenessDashboard />;
    case 'income-and-dependency':
      return <IncomeDependencyDashboard />;
    case 'local-financial-data':
      return <LocalFinancialDataDashboard />;
    default:
      return null;
  }
}

export default function Document({
  theme: initialTheme = 'default',
  categoryType,
}: DocumentProps) {
  const { documentSlug, category } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [nestedIndex, setNestedIndex] = useState<CategoryIndex | null>(null);
  const [dashboardDocument, setDashboardDocument] =
    useState<DashboardDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme)
  );

  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Home', href: '/' },
  ]);

  useEffect(() => {
    if (!documentSlug || !category || !categoryType) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const isGovernment = categoryType === 'government';
        const categories = isGovernment
          ? governmentCategories.categories
          : serviceCategories.categories;
        const sectionLabel = isGovernment ? 'Government' : 'Services';
        const sectionHref = isGovernment ? '/government' : '/services';
        const categoryData = categories.find(c => c.slug === category);
        const dashboard = getDashboardDocument(
          categoryType,
          category,
          documentSlug
        );

        if (dashboard) {
          setDashboardDocument(dashboard);
          setNestedIndex(null);
          setMarkdownContent(null);
          setBreadcrumbs([
            { label: 'Home', href: '/' },
            { label: sectionLabel, href: sectionHref },
            {
              label: categoryData?.category ?? category,
              href: `${sectionHref}/${category}`,
            },
            {
              label: dashboardTitles[dashboard],
              href: `${sectionHref}/${category}/${documentSlug}`,
            },
          ]);
          return;
        }

        setDashboardDocument(null);

        // If the slug maps to its own index, render it as a nested listing
        if (isNestedCategory(documentSlug)) {
          const index = await getCategorySubcategories(documentSlug);
          setNestedIndex(index);
          setBreadcrumbs([
            { label: 'Home', href: '/' },
            { label: sectionLabel, href: sectionHref },
            {
              label: categoryData?.category ?? category,
              href: `${sectionHref}/${category}`,
            },
            {
              label: documentSlug,
              href: `${sectionHref}/${category}/${documentSlug}`,
            },
          ]);
          return;
        }

        const content = await loadMarkdownContent(
          documentSlug,
          category,
          categoryType
        );
        setMarkdownContent(content);

        setBreadcrumbs([
          { label: 'Home', href: '/' },
          { label: sectionLabel, href: sectionHref },
          {
            label: categoryData?.category ?? category,
            href: `${sectionHref}/${category}`,
          },
          {
            label: content.title ?? documentSlug,
            href: `${sectionHref}/${category}/${documentSlug}`,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document'
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [documentSlug, category, categoryType]);

  if (loading) {
    return (
      <Section className="p-3 mb-12">
        <Banner type="info" description="Loading document..." />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Banner
          type="error"
          title="Document Not Found"
          description={error}
          icon
        />
      </Section>
    );
  }

  if (nestedIndex) {
    const nestedPages: Subcategory[] = nestedIndex.pages;

    if (
      categoryType === 'government' &&
      category === 'officials' &&
      documentSlug === 'legislative'
    ) {
      return (
        <>
          <SEO
            title={nestedIndex.title || documentSlug}
            description={nestedIndex.description}
            keywords={`${documentSlug}, government services, local government`}
          />
          <Section className="p-3 mb-12">
            <Breadcrumbs className="mb-8" items={breadcrumbs} />
            <OfficialsDirectoryCards
              title={nestedIndex.title}
              description={nestedIndex.description}
              pages={nestedPages}
            />
          </Section>
        </>
      );
    }

    return (
      <>
        <SEO
          title={documentSlug}
          keywords={`${documentSlug}, government services, local government`}
        />
        <Section className="p-3 mb-12">
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          {nestedIndex.title && (
            <Heading level={2}>{nestedIndex.title}</Heading>
          )}
          {nestedIndex.description && (
            <Text className="text-gray-600 mb-4">
              {nestedIndex.description}
            </Text>
          )}
          {nestedIndex.layout === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nestedPages.map((page, i) => (
                <Card hoverable key={page.slug ?? i} className="h-full">
                  <CardContent>
                    <h4 className="text-lg font-medium text-gray-900">
                      {page.name}
                    </h4>
                    {page.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {page.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {nestedPages.map((page, i) => (
                <Card key={page.slug ?? i} className="mb-4">
                  <CardContent>
                    <h4 className="text-lg font-medium text-gray-900">
                      {page.name}
                    </h4>
                    {page.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {page.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </>
    );
  }

  if (dashboardDocument) {
    return (
      <>
        <SEO
          title={dashboardTitles[dashboardDocument]}
          keywords={`${dashboardTitles[dashboardDocument]}, statistics, transparency, local government`}
        />
        <Section className="p-3 mb-12">
          <Breadcrumbs className="mb-8" items={breadcrumbs} />
          <DashboardContent dashboard={dashboardDocument} />
        </Section>
      </>
    );
  }

  if (!markdownContent) {
    return null;
  }

  return (
    <>
      <SEO
        title={markdownContent.title || documentSlug}
        description={
          markdownContent.description ||
          `Government service information for ${documentSlug}`
        }
        keywords={`${documentSlug}, government services, public services, local government`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        {categoryType === 'government' &&
        category === 'officials' &&
        documentSlug === 'executive' ? (
          <ExecutiveOfficialsCards
            title={markdownContent.title}
            description={markdownContent.description}
            data={markdownContent.data}
          />
        ) : (
          <Card className="mb-8 markdown-content">
            <CardHeader>
              {markdownContent.description && (
                <CardContent>{markdownContent.description}</CardContent>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {markdownContent.content}
              </ReactMarkdown>
            </CardHeader>
          </Card>
        )}
      </Section>
    </>
  );
}
