import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Section from '../components/ui/Section';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import {
  barangayHotlines,
  emergencyHotlines,
  formatPhone,
  municipalHotlines,
  nationalHotlines,
  telHref,
  type Hotline,
} from '../data/hotlines';

const REPORT_URL = 'https://github.com/egiebk/betteraparri/issues/new';

function CopyButton({ number, label }: { number: string; label: string }) {
  const [copied, setCopied] = useState(false);

  if (typeof navigator === 'undefined' || !navigator.clipboard) return null;

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          .writeText(number)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => setCopied(false));
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900 print:hidden"
      aria-label={`Copy ${label} number`}
    >
      <i
        aria-hidden="true"
        className={
          copied ? 'ri-check-line text-green-600' : 'ri-file-copy-line'
        }
      />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function HotlineCard({
  hotline,
  tone,
}: {
  hotline: Hotline;
  tone: 'emergency' | 'default';
}) {
  const isEmergency = tone === 'emergency';
  return (
    <li
      className={`flex h-full flex-col gap-3 rounded-lg border p-4 shadow-sm ${
        isEmergency ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isEmergency
              ? 'bg-red-600 text-white'
              : 'bg-primary-100 text-primary-700'
          }`}
        >
          <i className={`${hotline.icon} text-lg`} />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight text-gray-900">
            {hotline.label}
          </h3>
          {hotline.description && (
            <p className="mt-0.5 text-sm text-gray-600">
              {hotline.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <a
          href={telHref(hotline.number)}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 font-mono text-base font-bold ${
            isEmergency
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary-700 text-white hover:bg-primary-800'
          }`}
        >
          <i aria-hidden="true" className="ri-phone-fill" />
          {formatPhone(hotline.number)}
        </a>
        <CopyButton number={hotline.number} label={hotline.label} />
      </div>
    </li>
  );
}

function HotlineGroup({
  id,
  title,
  description,
  hotlines,
  tone = 'default',
}: {
  id: string;
  title: string;
  description: string;
  hotlines: Hotline[];
  tone?: 'emergency' | 'default';
}) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-bold text-gray-900">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotlines.map(hotline => (
          <HotlineCard key={hotline.label} hotline={hotline} tone={tone} />
        ))}
      </ul>
    </section>
  );
}

/** Builds a vCard file so people can save every number in one go. */
function downloadContacts() {
  const all = [
    ...emergencyHotlines.map(h => ({ name: `Aparri ${h.label}`, ...h })),
    ...nationalHotlines.map(h => ({ name: h.label, ...h })),
    ...municipalHotlines.map(h => ({ name: `Aparri ${h.label}`, ...h })),
    ...barangayHotlines
      .filter(b => b.number)
      .map(b => ({ name: `Brgy. ${b.name} Hall (Aparri)`, number: b.number! })),
  ];
  const escape = (value: string) => value.replace(/([,;\\])/g, '\\$1');
  const vcf = all
    .map(contact =>
      [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escape(contact.name)}`,
        `N:;${escape(contact.name)};;;`,
        `TEL;TYPE=VOICE:${contact.number}`,
        'END:VCARD',
      ].join('\r\n')
    )
    .join('\r\n');
  const blob = new Blob([vcf], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aparri-hotlines.vcf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function Hotlines() {
  const [query, setQuery] = useState('');
  const barangays = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return barangayHotlines;
    return barangayHotlines.filter(
      b =>
        b.name.toLowerCase().includes(q) || b.captain?.toLowerCase().includes(q)
    );
  }, [query]);
  const withNumbers = barangayHotlines.filter(b => b.number).length;

  return (
    <>
      <SEO
        title="Emergency Hotlines"
        description="Tap-to-call emergency, national and barangay hotlines for Aparri, Cagayan."
        pageType="WebPage"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Hotlines', href: '/hotlines' },
        ]}
      />

      <Section className="mb-12 p-3">
        <Breadcrumbs className="mb-8" />

        <Heading className="mb-2">Emergency Hotlines</Heading>
        <Text className="mb-6 max-w-3xl text-slate-600">
          Tap a number to call it from your phone. Save these numbers before
          typhoon season: mobile data can go down during storms, but calls and
          texts often still work.
        </Text>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">
          <button
            type="button"
            onClick={downloadContacts}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-800"
          >
            <i aria-hidden="true" className="ri-contacts-book-download-line" />
            Save all numbers to my phone
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <i aria-hidden="true" className="ri-printer-line" />
            Print this list
          </button>
        </div>

        <HotlineGroup
          id="aparri-emergency"
          title="Aparri emergency responders"
          description="Call these first for emergencies in Aparri. Open 24 hours."
          hotlines={emergencyHotlines}
          tone="emergency"
        />

        <HotlineGroup
          id="national"
          title="National hotlines"
          description="Free short numbers that work from any phone in the Philippines."
          hotlines={nationalHotlines}
        />

        <HotlineGroup
          id="municipal"
          title="Municipal Hall"
          description="For questions about town services, permits and documents."
          hotlines={municipalHotlines}
        />

        <section aria-labelledby="barangays" className="mt-10">
          <h2 id="barangays" className="text-xl font-bold text-gray-900">
            Barangay halls
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {withNumbers} of {barangayHotlines.length} barangays have a listed
            number. For the others, visit the barangay hall or call the
            Municipal Hall.
          </p>

          <label className="relative mt-4 block max-w-md print:hidden">
            <span className="sr-only">Search barangays</span>
            <i
              aria-hidden="true"
              className="ri-search-line pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by barangay or captain"
              className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900"
            />
          </label>

          <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Barangay
                  </th>
                  <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                    Punong Barangay
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Number
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {barangays.map(barangay => (
                  <tr key={barangay.slug}>
                    <td className="px-4 py-3">
                      <Link
                        to={`/government/barangays/${barangay.slug}`}
                        className="font-medium text-primary-700 underline-offset-4 hover:underline"
                      >
                        {barangay.name}
                      </Link>
                      {barangay.captain && (
                        <span className="block text-xs text-gray-500 sm:hidden">
                          {barangay.captain}
                        </span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                      {barangay.captain ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {barangay.number ? (
                        <a
                          href={telHref(barangay.number)}
                          className="inline-flex items-center gap-1.5 font-mono font-semibold text-primary-700 hover:text-primary-900"
                        >
                          <i aria-hidden="true" className="ri-phone-line" />
                          {formatPhone(barangay.number)}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Not listed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {barangays.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No barangay matches “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-10 text-xs leading-5 text-slate-500">
          Numbers can change. If a number is wrong or missing,{' '}
          <a
            href={REPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-700 underline"
          >
            let us know
          </a>
          . This is a volunteer-run list; in a life-threatening emergency, call
          911.
        </p>
      </Section>
    </>
  );
}
