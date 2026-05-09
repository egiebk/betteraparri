import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import type { Subcategory } from '../../data/yamlLoader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

interface BarangayProfile {
  punongBarangay?: string;
  telephone?: string;
}

interface BarangayCardsProps {
  title?: string;
  description?: string;
  pages: Subcategory[];
  showHeading?: boolean;
  source?: string;
}

const extractBarangayProfile = (content: string): BarangayProfile | null => {
  if (!content) return null;

  // Match "## Punong Barangay" section - name is on the same line as the bullet
  const punongMatch = content.match(
    /##\s+Punong Barangay\s*[\n\r]+[-*]\s+(.+?)(?:\n|$)/i
  );
  const telephoneMatch = content.match(
    /Barangay Telephone:\*\*\s+(.+?)(?:\n|$)/i
  );

  return {
    punongBarangay: punongMatch?.[1]?.trim(),
    telephone: telephoneMatch?.[1]?.trim(),
  };
};

export default function BarangayCards({
  title,
  description,
  pages,
  showHeading = false,
  source,
}: BarangayCardsProps) {
  const navigate = useNavigate();
  const [barangayData, setBarangayData] = useState<
    Record<string, BarangayProfile>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBarangayData = async () => {
      const data: Record<string, BarangayProfile> = {};

      for (const page of pages) {
        try {
          const module = await import(
            `../../../content/government/barangays/${page.slug}.md?raw`
          );
          const content = module.default;
          const profile = extractBarangayProfile(content);
          if (profile) {
            data[page.slug] = profile;
          }
        } catch (error) {
          console.error(`Failed to load barangay ${page.slug}:`, error);
        }
      }

      setBarangayData(data);
      setLoading(false);
    };

    loadBarangayData();
  }, [pages]);

  if (loading) {
    return <div>Loading barangay information...</div>;
  }

  return (
    <div className="pb-4">
      {showHeading && (
        <div className="mb-8 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
            Barangay Officials
          </p>
          {title && (
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {pages.map(page => {
          const profile = barangayData[page.slug] ?? {};
          const punongBarangay = profile.punongBarangay || 'Loading data...';
          const telephone = profile.telephone;

          return (
            <Card
              key={page.slug}
              hoverable
              className="h-full border-primary-100 hover:bg-blue-50"
            >
              <CardContent className="flex h-full flex-col p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                    Barangay
                  </span>
                </div>

                <h2 className="mb-3 text-xl font-semibold text-gray-900">
                  {page.name}
                </h2>

                <div className="mb-3 space-y-2 text-sm text-gray-600">
                  <p>
                    <i
                      className="ri-user-3-line mr-1 text-primary-700"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">
                      Punong Barangay:
                    </span>{' '}
                    {punongBarangay}
                  </p>
                  <p>
                    <i
                      className="ri-phone-line mr-1 text-primary-700"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-gray-700">
                      Telephone:
                    </span>{' '}
                    <span className="break-all">{telephone}</span>
                  </p>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-4 text-sm">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-primary-200 bg-white px-3 py-2 font-medium text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => {
                      navigate(`/government/barangays/${page.slug}`);
                    }}
                  >
                    View barangay profile
                    <i className="ri-arrow-right-line" aria-hidden="true" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {source && (
        <Card className="mt-8 border-primary-100 bg-gray-50">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">Source</h3>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-gray-600">{source}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
