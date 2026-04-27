import { Button } from '@bettergov/kapwa/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@bettergov/kapwa/card';
import type { Subcategory } from '../../data/yamlLoader';
import { useEffect, useState } from 'react';

interface BarangayProfile {
  punongBarangay?: string;
  telephone?: string;
}

interface BarangayCardsProps {
  title?: string;
  description?: string;
  pages: Subcategory[];
}

const extractBarangayProfile = (content: string): BarangayProfile | null => {
  if (!content) return null;

  const punongMatch = content.match(
    /##\s+Punong Barangay\s*\n+[-*]\s+(.+?)(?:\n|$)/i
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
}: BarangayCardsProps) {
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
            `../../content/government/barangays/${page.slug}.md?raw`
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
      {title && (
        <h2 className="text-4xl font-semibold text-slate-900">{title}</h2>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-base text-slate-600">{description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
        {pages.map(page => {
          const profile = barangayData[page.slug] ?? {};
          const punongBarangay =
            profile.punongBarangay || 'Information not yet available';
          const telephone = profile.telephone;

          return (
            <Card
              key={page.slug}
              hoverable
              className="overflow-hidden rounded-[1.5rem] shadow-sm"
            >
              <CardHeader className="px-5 py-5 sm:px-6">
                <h3 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
                  {page.name}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800 sm:text-sm">
                    <i className="ri-user-line mr-2 h-3.5 w-3.5" />
                    Punong Barangay
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-5 py-5 sm:px-6">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <i className="ri-user-3-line mt-0.5 h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        Chief/Leader
                      </p>
                      <p className="mt-1 text-sm text-slate-800 sm:text-base">
                        {punongBarangay}
                      </p>
                    </div>
                  </div>
                </div>

                {telephone && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-phone-line mt-0.5 h-4 w-4 text-primary-700" />
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
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
              <CardFooter className="px-5 pb-5 pt-0 sm:px-6">
                <Button
                  type="button"
                  size="md"
                  fullWidth
                  className="rounded-xl"
                  disabled={!telephone}
                  onClick={() => {
                    if (telephone) {
                      window.location.href = `tel:${telephone}`;
                    }
                  }}
                >
                  Call Barangay
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
