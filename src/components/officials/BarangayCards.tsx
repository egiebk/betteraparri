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
  pages,
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
          console.log('Loading barangay:', page.slug, 'content length:', content?.length);
          const profile = extractBarangayProfile(content);
          console.log('Profile for', page.slug, ':', profile);
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

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {pages.map(page => {
          const profile = barangayData[page.slug] ?? {};
          const punongBarangay =
            profile.punongBarangay || 'Information not yet available';
          const telephone = profile.telephone;

          return (
            <Card
              key={page.slug}
              hoverable
              className="overflow-hidden rounded-xl shadow-sm"
            >
              <CardHeader className="p-4 sm:px-4 bg-stone-100">
                <h3 className="text-lg font-medium text-slate-900 sm:text-xl">
                  {page.name}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:px-6">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
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
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <i className="ri-phone-line h-4 w-4 text-primary-700" />
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
              <CardFooter className="flex items-center justify-center px-5 pb-5 pt-0 sm:px-6">
                <Button
                  type="button"
                  size="md"
                  fullWidth
                  className="flex items-center justify-center gap-2 rounded-full"
                  onClick={() => {
                    navigate(`/government/barangays/${page.slug}`);
                  }}
                >
                  <i
                    className="ri-information-line inline-flex h-6 w-6 items-center justify-center"
                    aria-hidden="true"
                  />
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
