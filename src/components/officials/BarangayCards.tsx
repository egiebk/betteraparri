import { Button } from '@bettergov/kapwa/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@bettergov/kapwa/card';
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
          const punongBarangay =
            profile.punongBarangay || 'Waiting for data...';
          const telephone = profile.telephone;

          return (
            <Card
              key={page.slug}
              hoverable
              className="h-full overflow-hidden border-primary-100 shadow-sm hover:bg-blue-50"
            >
              <CardHeader className="bg-stone-100">
                <h4 className="text-md font-medium text-slate-900 sm:text-lg">
                  {page.name}
                </h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl">
                  <div className="flex items-center gap-3">
                    <i className="ri-user-3-line h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-light uppercase text-slate-500">
                        Punong Barangay
                      </p>
                      <p className="mt-1 text-sm text-slate-800 sm:text-base">
                        {punongBarangay}
                      </p>
                    </div>
                  </div>
                </div>

                {telephone && (
                  <div className="rounded-xl">
                    <div className="flex items-center gap-3">
                      <i className="ri-phone-line h-4 w-4 text-primary-700" />
                      <div>
                        <p className="text-[11px] font-light uppercase text-slate-500">
                          Telephone
                        </p>
                        <p className="mt-1 break-all text-sm text-slate-800 sm:text-base">
                          {telephone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-center px-5 pb-5 pt-0 sm:px-6">
                <Button
                  type="button"
                  size="sm"
                  fullWidth
                  className="flex items-center py-6 hover:bg-primary-700 justify-center gap-2 rounded-full"
                  onClick={() => {
                    navigate(`/government/barangays/${page.slug}`);
                  }}
                >
                  <i
                    className="ri-information-line inline-flex h-6 w-6 items-center justify-center"
                    aria-hidden="true"
                  />
                  View Barangay Profile
                </Button>
              </CardFooter>
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
