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
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-base text-slate-600">{description}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {pages.map(page => {
          const profile = profileMap[page.slug] ?? {};
          const position = profile.position || page.description || 'Official';
          const address = profile.address || 'Address not yet available';
          const email = profile.email;

          return (
            <Card
              key={page.slug}
              hoverable
              className="overflow-hidden rounded-xl shadow-sm"
            >
              <CardHeader className="p-4 sm:px-4 bg-gray-50">
                <h4 className="text-md font-medium text-slate-900 sm:text-lg">
                  {page.name}
                </h4>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm text-primary-800 sm:text-sm">
                    <i className="ri-building-line mr-2 h-4 w-4" />
                    {position}
                  </span>
                </div>
                <div className="rounded-xl">
                  <div className="flex items-center gap-3">
                    <i className="ri-map-pin-line mt-0.5 h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-light uppercase text-slate-500">
                        Office Address
                      </p>
                      <p className="mt-1 text-sm text-slate-800 sm:text-base">
                        {address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-mail-line mt-0.5 h-4 w-4 text-primary-700" />
                    <div>
                      <p className="text-[11px] font-light uppercase text-slate-500">
                        Email Address
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-800 sm:text-base">
                        <a href={`mailto:${email}`} className="text-primary-600 hover:underline">
                          {email || 'Email not yet available'}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
