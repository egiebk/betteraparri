import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import type { Subcategory } from '../../data/yamlLoader';
import legislativeIndexContent from '../../../content/government/leadership/legislative/index.yaml?raw';
import alexVillanuevaAgbangloContent from '../../../content/government/leadership/legislative/alex-villanueva-agbanglo.md?raw';
import bryanDaleGorospeChanContent from '../../../content/government/leadership/legislative/bryan-dale-gorospe-chan.md?raw';
import dianJaycerettAlzagaDayagContent from '../../../content/government/leadership/legislative/dian-jaycerett-alzaga-dayag.md?raw';
import ismaelDeciertoTumaruIiiContent from '../../../content/government/leadership/legislative/ismael-decierto-tumaru-iii.md?raw';
import joevanLubbuiAlbanioContent from '../../../content/government/leadership/legislative/joevan-lubbui-albanio.md?raw';
import joylynFloridaEslabonContent from '../../../content/government/leadership/legislative/joylyn-florida-eslabon.md?raw';
import julieAnnDeciertoAlamedaContent from '../../../content/government/leadership/legislative/julie-ann-decierto-alameda.md?raw';
import larryAyumayumChanSrContent from '../../../content/government/leadership/legislative/larry-ayumayum-chan-sr.md?raw';
import ronaldMarasiganLabbaoContent from '../../../content/government/leadership/legislative/ronald-marasigan-labbao.md?raw';
import yaml from 'js-yaml';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

type LeadershipData = {
  GOVERNMENT_NAME?: string;
  MAYOR?: string;
  MAYOR_EMAIL?: string;
  MAYOR_IMAGE?: string;
  MAYOR_IMAGE_SOURCE?: string;
  MAYOR_ADDRESS?: string;
  VICE_MAYOR?: string;
  OFFICE_EMAIL?: string;
  OFFICE_ADDRESS?: string;
  LEGISLATIVE_OFFICE_EMAIL?: string;
  LEGISLATIVE_OFFICE_ADDRESS?: string;
  LEADERSHIP_SOURCE?: string;
};

type OfficialProfile = {
  position?: string;
  address?: string;
  email?: string;
};

interface LeadershipOfficialsCardsProps {
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
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

const legislativeIndex = yaml.load(legislativeIndexContent) as {
  pages?: Subcategory[];
};

const legislativePages = legislativeIndex.pages ?? [];

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

function LeadOfficialCard({
  name,
  position,
  office,
  address,
  email,
}: {
  name: string;
  position: string;
  office: string;
  address?: string;
  email?: string;
}) {
  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col gap-5 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-primary-700">
            {office}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900">
            {name}
          </h2>
          <p className="mt-2 text-sm font-semibold text-gray-700">{position}</p>
        </div>
        <div className="mt-auto space-y-4 border-t border-gray-100 pt-4">
          <ContactRow
            icon="ri-map-pin-line"
            label="Office Address"
            value={address || 'Address not yet available'}
          />
          <ContactRow
            href={email ? `mailto:${email}` : undefined}
            icon="ri-mail-line"
            label="Email Address"
            value={email || 'Email not yet available'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CouncilorCard({ page }: { page: Subcategory }) {
  const profile = profileMap[page.slug] ?? {};
  const position = profile.position || page.description || 'Official';

  return (
    <Card hoverable className="h-full border-primary-100 hover:bg-blue-50">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-gray-900">
              {page.name}
            </h3>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              {position}
            </p>
          </div>
        </div>
        <div className="mt-auto space-y-4 border-t border-gray-100 pt-4">
          <ContactRow
            icon="ri-map-pin-line"
            label="Office Address"
            value={profile.address || 'Address not yet available'}
          />
          <ContactRow
            href={profile.email ? `mailto:${profile.email}` : undefined}
            icon="ri-mail-line"
            label="Email Address"
            value={profile.email || 'Email not yet available'}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = href ? (
    <a className="text-primary-600 hover:underline" href={href}>
      {value}
    </a>
  ) : (
    value
  );

  return (
    <div className="flex items-start gap-3">
      <i className={`${icon} mt-0.5 text-base text-primary-700`} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-gray-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm leading-relaxed text-gray-800">
          {content}
        </p>
      </div>
    </div>
  );
}

export default function LeadershipOfficialsCards({
  title,
  description,
  data,
}: LeadershipOfficialsCardsProps) {
  const leadership = (data ?? {}) as LeadershipData;
  const mayorName = leadership.MAYOR || 'Mayor';
  const viceMayor =
    legislativePages.find(
      page => page.description === 'Municipal Vice Mayor'
    ) ?? legislativePages[0];
  const councilors = legislativePages.filter(
    page => page.slug !== viceMayor?.slug
  );
  const viceMayorProfile = viceMayor ? profileMap[viceMayor.slug] : {};
  const sourceNote = leadership.LEADERSHIP_SOURCE;

  return (
    <div className="pb-4">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
          Elected Officials
        </p>
        <Heading level={1} className="mb-2 text-3xl md:text-4xl">
          {title || 'Leadership'}
        </Heading>
        {description && <Text className="text-gray-600">{description}</Text>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.52fr)]">
        <div className="grid gap-5 md:grid-cols-2">
          <LeadOfficialCard
            address={leadership.MAYOR_ADDRESS || leadership.OFFICE_ADDRESS}
            email={leadership.MAYOR_EMAIL || leadership.OFFICE_EMAIL}
            name={mayorName}
            office="Office of the Municipal Mayor"
            position="Municipal Mayor"
          />
          <LeadOfficialCard
            address={
              viceMayorProfile.address || leadership.LEGISLATIVE_OFFICE_ADDRESS
            }
            email={
              viceMayorProfile.email || leadership.LEGISLATIVE_OFFICE_EMAIL
            }
            name={leadership.VICE_MAYOR || viceMayor?.name || 'Vice Mayor'}
            office="Office of the Municipal Vice Mayor"
            position="Municipal Vice Mayor"
          />
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-5 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-normal text-primary-700">
            Legislative Council
          </p>
          <Heading level={2} className="mb-2 text-2xl md:text-3xl">
            Sangguniang Bayan Members
          </Heading>
          <Text className="text-gray-600">
            Councilors are listed in a three-column directory with available
            contact details from the legislative office records.
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {councilors.map(page => (
            <CouncilorCard key={page.slug} page={page} />
          ))}
        </div>
      </section>

      {sourceNote && (
        <Card className="mt-8 border-primary-100 bg-gray-50">
          <CardHeader className="bg-stone-100">
            <h3 className="text-lg font-semibold text-gray-900">Source</h3>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm leading-relaxed text-gray-600">
              {sourceNote}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
