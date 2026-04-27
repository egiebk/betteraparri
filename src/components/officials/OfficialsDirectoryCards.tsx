import { Button } from '@bettergov/kapwa/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@bettergov/kapwa/card';
import type { Subcategory } from '../../data/yamlLoader';
import alexVillanuevaAgbangloContent from '../../../content/government/officials/legislative/alex-villanueva-agbanglo.md?raw';
import bryanDaleGorospeChanContent from '../../../content/government/officials/legislative/bryan-dale-gorospe-chan.md?raw';
import dianJaycerettAlzagaDayagContent from '../../../content/government/officials/legislative/dian-jaycerett-alzaga-dayag.md?raw';
import ismaelDeciertoTumaruIiiContent from '../../../content/government/officials/legislative/ismael-decierto-tumaru-iii.md?raw';
import joevanLubbuiAlbanioContent from '../../../content/government/officials/legislative/joevan-lubbui-albanio.md?raw';
import joylynFloridaEslabonContent from '../../../content/government/officials/legislative/joylyn-florida-eslabon.md?raw';
import julieAnnDeciertoAlamedaContent from '../../../content/government/officials/legislative/julie-ann-decierto-alameda.md?raw';
import larryAyumayumChanSrContent from '../../../content/government/officials/legislative/larry-ayumayum-chan-sr.md?raw';
import ronaldMarasiganLabbaoContent from '../../../content/government/officials/legislative/ronald-marasigan-labbao.md?raw';

type OfficialProfile = {
  position?: string;
  address?: string;
  email?: string;
};

interface OfficialsDirectoryCardsProps {
  title?: string;
  description?: string;
  pages: Subcategory[];
}

function extractOfficialProfile(content: string): OfficialProfile {
  const lines = content.split('\n');
  const position = lines[2]?.trim() || undefined;
  const addressMatch = content.match(/please contact .*? at (.+?)\./i);
  const emailMatch = content.match(/Email:\s*([^\s]+)/i);

  return {
    position,
    address: addressMatch?.[1]?.trim(),
    email: emailMatch?.[1]?.trim(),
  };
}

const profileMap: Record<string, OfficialProfile> = {
  'alex-villanueva-agbanglo': extractOfficialProfile(
    alexVillanuevaAgbangloContent
  ),
  'bryan-dale-gorospe-chan': extractOfficialProfile(
    bryanDaleGorospeChanContent
  ),
  'dian-jaycerett-alzaga-dayag': extractOfficialProfile(
    dianJaycerettAlzagaDayagContent
  ),
  'ismael-decierto-tumaru-iii': extractOfficialProfile(
    ismaelDeciertoTumaruIiiContent
  ),
  'joevan-lubbui-albanio': extractOfficialProfile(joevanLubbuiAlbanioContent),
  'joylyn-florida-eslabon': extractOfficialProfile(joylynFloridaEslabonContent),
  'julie-ann-decierto-alameda': extractOfficialProfile(
    julieAnnDeciertoAlamedaContent
  ),
  'larry-ayumayum-chan-sr': extractOfficialProfile(larryAyumayumChanSrContent),
  'ronald-marasigan-labbao': extractOfficialProfile(
    ronaldMarasiganLabbaoContent
  ),
};

export default function OfficialsDirectoryCards({
  title,
  description,
  pages,
}: OfficialsDirectoryCardsProps) {
  return (
    <div className="pb-4">
      {title && (
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-base text-slate-600">{description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-4">
        {pages.map(page => {
          const profile = profileMap[page.slug] ?? {};
          const position = profile.position || page.description || 'Official';
          const address = profile.address || 'Address not yet available';
          const email = profile.email;

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
                    <i className="ri-building-line mr-2 h-3.5 w-3.5" />
                    {position}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3  px-5 py-5 sm:px-6">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <i className="ri-map-pin-line mt-0.5 h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        Location / Address
                      </p>
                      <p className="mt-1 text-sm text-slate-800 sm:text-base">
                        {address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <i className="ri-mail-line mt-0.5 h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-800 sm:text-base">
                        {email || 'Email not yet available'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-5 pb-5 pt-0 sm:px-6">
                <Button
                  type="button"
                  size="md"
                  fullWidth
                  className="rounded-xl"
                  disabled={!email}
                  onClick={() => {
                    if (email) {
                      window.location.href = `mailto:${email}`;
                    }
                  }}
                >
                  Send an Email
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
