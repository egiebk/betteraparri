import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { glossary, type GlossaryEntry } from '../../data/glossary';

/**
 * Plain-language tooltips for jargon and acronyms.
 *
 * - <GlossaryTerm entry={...}>NTA</GlossaryTerm> renders one term.
 * - <GlossaryText text="..." /> scans a string and wraps the first
 *   occurrence of every known term (see src/data/glossary.ts).
 * - glossarize() in src/lib/glossarize.tsx does the same for markdown.
 *
 * Desktop: hover to preview, click to keep it open. Mobile: tap to open,
 * tap anywhere else (or press Escape) to close.
 */

const lookup = new Map<string, GlossaryEntry>();
for (const entry of glossary) {
  for (const spelling of entry.match) lookup.set(spelling, entry);
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Longest spellings first so "Sangguniang Bayan" wins over shorter matches.
const termPattern = new RegExp(
  `\\b(${[...lookup.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|')})\\b`,
  'g'
);

const TOOLTIP_WIDTH = 288; // matches w-72

export function GlossaryTerm({
  entry,
  children,
}: {
  entry: GlossaryEntry;
  children: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const open = hovered || pinned;

  useEffect(() => {
    if (!open) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setAlignRight(rect.left + TOOLTIP_WIDTH > window.innerWidth - 16);
    }
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setPinned(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, pinned]);

  return (
    <span
      ref={wrapperRef}
      className="relative inline"
      onPointerEnter={event => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={event => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setPinned(value => !value)}
        className="cursor-help border-b border-dotted border-current leading-[inherit] hover:text-primary-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 print:border-none"
      >
        {children}
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`absolute top-full z-40 mt-2 block w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-left text-sm font-normal normal-case leading-relaxed tracking-normal text-gray-700 shadow-lg print:hidden ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          <span className="mb-1 block font-semibold text-gray-900">
            {entry.term}
          </span>
          {entry.definition}
        </span>
      )}
    </span>
  );
}

/** Wraps the first occurrence of each glossary term in `text`. */
export function GlossaryText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const seen = new Set<GlossaryEntry>();
  let lastIndex = 0;

  for (const match of text.matchAll(termPattern)) {
    const entry = lookup.get(match[0]);
    if (!entry || seen.has(entry) || match.index === undefined) continue;
    seen.add(entry);
    parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <GlossaryTerm key={match.index} entry={entry}>
        {match[0]}
      </GlossaryTerm>
    );
    lastIndex = match.index + match[0].length;
  }

  if (parts.length === 0) return <>{text}</>;
  parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}
