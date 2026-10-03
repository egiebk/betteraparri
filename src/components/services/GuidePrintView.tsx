import {
  formatCheckedDate,
  guideHref,
  type ServiceGuide,
} from '../../data/serviceGuides';

export type GuidePrintMode = 'full' | 'checklist';

const MUNICIPAL_HALL_PHONE = '078-888-2001';

function todayLabel() {
  return new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function pageUrl(guide: ServiceGuide) {
  const base =
    (import.meta.env.VITE_WEBSITE_URL as string | undefined) ??
    window.location.origin;
  return `${base.replace(/\/$/, '')}${guideHref(guide)}`;
}

function PrintHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-5 border-b border-black pb-1 text-sm font-bold uppercase tracking-wide break-after-avoid">
      {children}
    </h2>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 items-center justify-center border border-black text-[11px] font-bold leading-none"
    >
      {checked ? '✓' : ''}
    </span>
  );
}

/**
 * Ink-friendly, print-only version of a guide. Rendered with
 * `hidden print:block`, so it never shows on screen.
 *
 * - `full`: everything on the guide page.
 * - `checklist`: a one-page sheet to bring to the Municipal Hall (quick
 *   facts, what to bring, the steps and space for notes).
 */
export default function GuidePrintView({
  guide,
  mode,
  checked,
}: {
  guide: ServiceGuide;
  mode: GuidePrintMode;
  checked: Set<number>;
}) {
  const full = mode === 'full';
  const facts = [
    { label: 'How much', value: guide.fee.label, detail: guide.fee.detail },
    { label: 'How long', value: guide.time.label, detail: guide.time.detail },
    { label: 'Where to go', value: guide.office, detail: guide.location },
    { label: 'Who can apply', value: guide.whoCanApply },
  ];

  return (
    <article className="hidden text-[12px] leading-snug text-black print:block">
      <header className="mb-3 border-b-2 border-black pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider">
          BetterAparri.org · {full ? 'Step-by-step guide' : 'Checklist'}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{guide.title}</h1>
        {full && <p className="mt-1">{guide.summary}</p>}
        <p className="mt-1 text-[10px] text-gray-700">
          Official name: {guide.officialName} · Info checked{' '}
          {formatCheckedDate(guide.source.checked)} · Printed {todayLabel()}
        </p>
      </header>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            {facts.map(fact => (
              <td
                key={fact.label}
                className="w-1/4 border border-black p-2 align-top"
              >
                <p className="text-[10px] font-semibold uppercase">
                  {fact.label}
                </p>
                <p className="font-bold">{fact.value}</p>
                {full && fact.detail && (
                  <p className="mt-1 text-[10px]">{fact.detail}</p>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {full &&
        guide.notices?.map(notice => (
          <p
            key={notice.text}
            className="mt-3 border border-dashed border-black p-2 break-inside-avoid"
          >
            <strong>Note:</strong> {notice.text}
          </p>
        ))}

      {full && guide.beforeYouGo && guide.beforeYouGo.length > 0 && (
        <section className="break-inside-avoid">
          <PrintHeading>Before you go</PrintHeading>
          <ul className="list-disc space-y-1 pl-5">
            {guide.beforeYouGo.map(tip => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <PrintHeading>What to bring</PrintHeading>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black text-left text-[10px] uppercase">
              <th className="w-6 py-1" />
              <th className="py-1 pr-2">Item</th>
              <th className="py-1 pr-2">Get it from</th>
            </tr>
          </thead>
          <tbody>
            {guide.requirements.map((requirement, index) => (
              <tr
                key={requirement.item}
                className="border-b border-gray-400 align-top break-inside-avoid"
              >
                <td className="py-1.5">
                  <CheckBox checked={checked.has(index)} />
                </td>
                <td className="py-1.5 pr-2">
                  <span className="font-semibold">{requirement.item}</span>
                  {requirement.optional && (
                    <span className="ml-1 text-[10px] italic">
                      (if it applies)
                    </span>
                  )}
                  {full && requirement.note && (
                    <span className="block text-[10px]">
                      {requirement.note}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2">{requirement.from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <PrintHeading>Steps</PrintHeading>
        <ol className="space-y-1.5">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="flex gap-2 break-inside-avoid">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black text-[10px] font-bold">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold">
                  {step.title}
                  {(step.where || step.time) && (
                    <span className="font-normal">
                      {' '}
                      — {[step.where, step.time].filter(Boolean).join(', ')}
                    </span>
                  )}
                </p>
                {full && step.detail && <p>{step.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {full && guide.afterward && guide.afterward.length > 0 && (
        <section className="break-inside-avoid">
          <PrintHeading>After you finish</PrintHeading>
          <ul className="list-disc space-y-1 pl-5">
            {guide.afterward.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {full && guide.terms && guide.terms.length > 0 && (
        <section>
          <PrintHeading>Words you might hear</PrintHeading>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {guide.terms.map(term => (
              <div key={term.term} className="break-inside-avoid">
                <dt className="font-semibold">{term.term}</dt>
                <dd className="text-[11px]">{term.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {!full && (
        <section className="break-inside-avoid">
          <PrintHeading>Notes</PrintHeading>
          <div className="space-y-5 pt-3">
            <div className="border-b border-gray-500" />
            <div className="border-b border-gray-500" />
            <div className="border-b border-gray-500" />
          </div>
        </section>
      )}

      <footer className="mt-5 border-t border-black pt-2 text-[10px] break-inside-avoid">
        <p>
          Requirements and fees can change. If unsure, call the Municipal Hall
          at {MUNICIPAL_HALL_PHONE} (Mon to Fri, 8 AM to 5 PM).
        </p>
        <p>
          Source: {guide.source.label} ({guide.source.url})
        </p>
        <p>Online version: {pageUrl(guide)}</p>
      </footer>
    </article>
  );
}
