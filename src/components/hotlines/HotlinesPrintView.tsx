import {
  barangayHotlines,
  emergencyHotlines,
  formatPhone,
  municipalHotlines,
  nationalHotlines,
  type BarangayHotline,
  type Hotline,
} from '../../data/hotlines';

export type HotlinesPrintMode = 'list' | 'fridge';

function todayLabel() {
  return new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function pageUrl() {
  const base =
    (import.meta.env.VITE_WEBSITE_URL as string | undefined) ??
    window.location.origin;
  return `${base.replace(/^https?:\/\//, '').replace(/\/$/, '')}/hotlines`;
}

function PrintHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 mt-4 border-b border-black pb-1 text-[11px] font-bold uppercase tracking-wide break-after-avoid">
      {children}
    </h2>
  );
}

/** Blank line to fill in by hand. */
function WriteIn({ label }: { label: string }) {
  return (
    <div className="flex items-end gap-2 pt-4">
      <span className="shrink-0 font-semibold">{label}</span>
      <span className="h-0 flex-1 border-b border-black" />
    </div>
  );
}

function HotlineTable({
  hotlines,
  size,
}: {
  hotlines: Hotline[];
  size: 'large' | 'normal';
}) {
  const large = size === 'large';
  return (
    <table className="w-full border-collapse break-inside-avoid">
      <tbody>
        {hotlines.map(hotline => (
          <tr key={hotline.label} className="border-b border-gray-400">
            <td className={large ? 'py-2 pr-2' : 'py-1 pr-2'}>
              <span className={large ? 'text-[15px] font-bold' : 'font-bold'}>
                {hotline.label}
              </span>
              {hotline.description && (
                <span className="block text-[10px] text-gray-700">
                  {hotline.description}
                </span>
              )}
            </td>
            <td
              className={`whitespace-nowrap text-right font-mono font-bold ${
                large ? 'py-2 text-[20px]' : 'py-1 text-[13px]'
              }`}
            >
              {formatPhone(hotline.number)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BarangayColumns() {
  // Two columns side by side so all barangays fit on the page.
  const half = Math.ceil(barangayHotlines.length / 2);
  const columns = [
    barangayHotlines.slice(0, half),
    barangayHotlines.slice(half),
  ];
  return (
    <div className="grid grid-cols-2 gap-x-6">
      {columns.map((column, index) => (
        <table key={index} className="w-full border-collapse text-[10.5px]">
          <tbody>
            {column.map(barangay => (
              <tr
                key={barangay.slug}
                className="border-b border-gray-300 break-inside-avoid"
              >
                <td className="py-[3px] pr-2 font-semibold">{barangay.name}</td>
                <td className="whitespace-nowrap py-[3px] text-right font-mono">
                  {barangay.number ? (
                    formatPhone(barangay.number)
                  ) : (
                    // Blank space so people can write the number in.
                    <span className="inline-block w-24 border-b border-dotted border-gray-500">
                      &nbsp;
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <header className="mb-3 border-b-2 border-black pb-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider">
        BetterAparri.org · {subtitle}
      </p>
      <h1 className="mt-1 text-2xl font-bold">Aparri Emergency Hotlines</h1>
    </header>
  );
}

function Call911Banner() {
  return (
    <p className="mb-3 border-2 border-black p-2 text-center text-[14px] font-bold break-inside-avoid">
      Life-threatening emergency? Call{' '}
      <span className="font-mono text-[20px]">911</span>
    </p>
  );
}

function Footer() {
  return (
    <footer className="mt-4 border-t border-black pt-1.5 text-[9px] text-gray-700">
      Printed {todayLabel()}. Numbers can change; see the latest list at{' '}
      <strong>{pageUrl()}</strong>. BetterAparri.org is a volunteer-run site,
      not an official government website.
    </footer>
  );
}

/**
 * Ink-friendly, print-only versions of the hotlines page. Rendered with
 * `hidden print:block`, so it never shows on screen.
 *
 * - `list`: every number on one A4/Letter page, including all barangay
 *   halls (blank lines where no number is listed yet).
 * - `fridge`: a large-type sheet to post at home, with the household's
 *   own barangay and space to write family contacts.
 */
export default function HotlinesPrintView({
  mode,
  barangay,
}: {
  mode: HotlinesPrintMode;
  barangay?: BarangayHotline;
}) {
  if (mode === 'fridge') {
    return (
      <article className="hidden text-[12px] leading-snug text-black print:block">
        <Header subtitle="Keep this near your phone" />
        <Call911Banner />

        <PrintHeading>Aparri emergency (24 hours)</PrintHeading>
        <HotlineTable hotlines={emergencyHotlines} size="large" />

        <PrintHeading>Our barangay</PrintHeading>
        {barangay ? (
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-gray-400">
                <td className="py-2 pr-2">
                  <span className="text-[15px] font-bold">
                    Brgy. {barangay.name} Hall
                  </span>
                  {barangay.captain && (
                    <span className="block text-[10px] text-gray-700">
                      Punong Barangay: {barangay.captain}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap py-2 text-right font-mono text-[20px] font-bold">
                  {barangay.number ? (
                    formatPhone(barangay.number)
                  ) : (
                    <span className="inline-block w-40 border-b border-black">
                      &nbsp;
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <>
            <WriteIn label="Barangay:" />
            <WriteIn label="Barangay hall number:" />
          </>
        )}
        <WriteIn label="Nearest evacuation center:" />

        <PrintHeading>Family and neighbors</PrintHeading>
        <WriteIn label="Name / number:" />
        <WriteIn label="Name / number:" />
        <WriteIn label="Name / number:" />

        <PrintHeading>Other hotlines</PrintHeading>
        <HotlineTable
          hotlines={[...nationalHotlines.slice(1), ...municipalHotlines]}
          size="normal"
        />

        <Footer />
      </article>
    );
  }

  return (
    <article className="hidden text-[12px] leading-snug text-black print:block">
      <Header subtitle="Full hotline list" />
      <Call911Banner />

      <div className="grid grid-cols-2 gap-x-6">
        <section>
          <PrintHeading>Aparri emergency (24 hours)</PrintHeading>
          <HotlineTable hotlines={emergencyHotlines} size="normal" />
        </section>
        <section>
          <PrintHeading>National hotlines</PrintHeading>
          <HotlineTable hotlines={nationalHotlines} size="normal" />
          <PrintHeading>Municipal Hall</PrintHeading>
          <HotlineTable hotlines={municipalHotlines} size="normal" />
        </section>
      </div>

      <PrintHeading>Barangay halls</PrintHeading>
      <p className="mb-1 text-[10px] text-gray-700">
        Blank lines are barangays with no listed number yet; write it in once
        you know it.
      </p>
      <BarangayColumns />

      <Footer />
    </article>
  );
}
