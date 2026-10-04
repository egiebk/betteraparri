import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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
const GAP = 8;
const EDGE = 16;

type Position = { left: number; top?: number; bottom?: number };

/**
 * Places the tooltip next to the term using viewport coordinates. Below the
 * term by default, above it when there isn't room below, and kept inside
 * the screen horizontally.
 */
function computePosition(anchor: DOMRect, tooltipHeight: number): Position {
  const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - EDGE * 2);
  const left = Math.min(
    Math.max(anchor.left, EDGE),
    window.innerWidth - width - EDGE
  );
  const fitsBelow =
    anchor.bottom + GAP + tooltipHeight <= window.innerHeight - EDGE;
  const fitsAbove = anchor.top - GAP - tooltipHeight >= EDGE;
  if (!fitsBelow && fitsAbove) {
    return { left, bottom: window.innerHeight - anchor.top + GAP };
  }
  return { left, top: anchor.bottom + GAP };
}

export function GlossaryTerm({
  entry,
  children,
}: {
  entry: GlossaryEntry;
  children: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const open = hovered || pinned;

  // The tooltip is rendered in a portal on <body> with fixed positioning,
  // so cards with overflow-hidden or later siblings can't clip or cover it.
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const update = () => {
      const anchor = buttonRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const height = tooltipRef.current?.offsetHeight ?? 120;
      setPosition(computePosition(anchor, height));
    };
    update();
    // Measure again once the tooltip has rendered and has a real height.
    const frame = requestAnimationFrame(update);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(false);
        setHovered(false);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !tooltipRef.current?.contains(target)
      ) {
        setPinned(false);
        setHovered(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const hoverHandlers = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(true);
    },
    onPointerLeave: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(false);
    },
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setPinned(value => !value)}
        {...hoverHandlers}
        className="cursor-help border-b border-dotted border-current leading-[inherit] hover:text-primary-700 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 print:border-none"
      >
        {children}
      </button>
      {open &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            {...hoverHandlers}
            style={{
              left: position?.left ?? 0,
              top: position?.top,
              bottom: position?.bottom,
              visibility: position ? 'visible' : 'hidden',
            }}
            className="fixed z-[60] block w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-left text-sm font-normal normal-case leading-relaxed tracking-normal text-gray-700 shadow-lg print:hidden"
          >
            <span className="mb-1 block font-semibold text-gray-900">
              {entry.term}
            </span>
            {entry.definition}
          </span>,
          document.body
        )}
    </>
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
