/** Shared UI pieces for the Procurement and DPWH Projects pages. */
import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import { cn } from '../../../lib/utils';
import { formatPeso } from '../../../lib/contracts';

type Amounted = { budget: number };

export function YearChart<T extends Amounted>({
  records,
  yearOf,
  selected,
  onSelect,
  title,
  description,
  countLabel = 'contracts',
}: {
  records: T[];
  yearOf: (r: T) => string | null;
  selected: string | null;
  onSelect: (year: string | null) => void;
  title: string;
  description: string;
  countLabel?: string;
}) {
  const byYear = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    records.forEach(r => {
      const y = yearOf(r);
      if (!y) return;
      const cur = map.get(y) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += r.budget;
      map.set(y, cur);
    });
    const years = [...map.keys()].map(Number);
    const out: { year: string; count: number; total: number }[] = [];
    for (let y = Math.min(...years); y <= Math.max(...years); y++) {
      out.push({
        year: String(y),
        ...(map.get(String(y)) ?? { count: 0, total: 0 }),
      });
    }
    return out;
  }, [records, yearOf]);
  const max = Math.max(...byYear.map(y => y.total), 1);

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div
          className="flex h-56 items-end gap-1.5"
          role="group"
          aria-label={title}
        >
          {byYear.map(y => {
            const active = selected === y.year;
            const dimmed = selected !== null && !active;
            return (
              <button
                key={y.year}
                type="button"
                onClick={() => onSelect(active ? null : y.year)}
                aria-pressed={active}
                disabled={y.count === 0}
                title={`${y.year}: ${y.count} ${countLabel}, ${formatPeso(y.total)}`}
                className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 disabled:cursor-default"
              >
                <span
                  className={cn(
                    'text-[10px] font-semibold tabular-nums sm:text-xs',
                    active ? 'text-primary-800' : 'text-gray-600'
                  )}
                >
                  {y.count > 0 ? y.count : ''}
                </span>
                <span
                  className={cn(
                    'w-full rounded-t transition',
                    active
                      ? 'bg-primary-700'
                      : dimmed
                        ? 'bg-primary-200'
                        : 'bg-primary-500 group-hover:bg-primary-600'
                  )}
                  style={{
                    height: `${Math.max((y.total / max) * 100, y.count ? 2 : 0)}%`,
                  }}
                />
                <span
                  className={cn(
                    'text-[10px] tabular-nums sm:text-xs',
                    active ? 'font-bold text-primary-800' : 'text-gray-500'
                  )}
                >
                  {`'${y.year.slice(2)}`}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Bar height is the total amount; the number above each bar is the
          number of {countLabel}.
        </p>
      </CardContent>
    </Card>
  );
}

export function TopContractors<T extends Amounted>({
  records,
  nameOf,
  selected,
  onSelect,
  limit = 6,
  countLabel = ['contract', 'contracts'],
}: {
  records: T[];
  nameOf: (r: T) => string | null;
  selected: string | null;
  onSelect: (name: string | null) => void;
  limit?: number;
  countLabel?: [string, string];
}) {
  const rows = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    records.forEach(r => {
      const name = nameOf(r);
      if (!name) return;
      const cur = map.get(name) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += r.budget;
      map.set(name, cur);
    });
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [records, nameOf]);
  const total = rows.reduce((s, r) => s + r.total, 0);
  const top = rows.slice(0, limit);
  const topShare = total
    ? (top.reduce((s, r) => s + r.total, 0) / total) * 100
    : 0;
  const max = top[0]?.total ?? 1;

  return (
    <Card className="h-full border-primary-100">
      <CardHeader className="bg-stone-100">
        <h3 className="text-lg font-semibold text-gray-900">Top contractors</h3>
        <p className="mt-1 text-sm text-gray-600">
          These {top.length} of {rows.length} contractors received{' '}
          {topShare.toFixed(0)}% of the total amount. Select one to see their{' '}
          {countLabel[1]}.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-100">
          {top.map(row => {
            const active = selected === row.name;
            return (
              <li key={row.name}>
                <button
                  type="button"
                  onClick={() => onSelect(active ? null : row.name)}
                  aria-pressed={active}
                  className={cn(
                    'w-full px-6 py-3 text-left transition hover:bg-primary-50/50',
                    active && 'bg-primary-50'
                  )}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-medium text-gray-900">
                      {row.name}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-gray-900">
                      {formatPeso(row.total)}
                    </span>
                  </span>
                  <span className="mt-2 flex items-center gap-3">
                    <span className="h-2 flex-1 rounded-full bg-gray-100">
                      <span
                        className="block h-2 rounded-full bg-primary-600"
                        style={{ width: `${(row.total / max) * 100}%` }}
                      />
                    </span>
                    <span className="shrink-0 text-xs text-gray-600">
                      {row.count}{' '}
                      {row.count === 1 ? countLabel[0] : countLabel[1]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800 hover:bg-primary-100"
    >
      {label}
      <i aria-hidden="true" className="ri-close-line" />
      <span className="sr-only">Remove filter</span>
    </button>
  );
}

export function ChipGroup<V extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: V | null; label: string; count: number }[];
  value: V | null;
  onChange: (v: V | null) => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={label}
    >
      <span className="mr-1 text-sm font-semibold text-gray-700">{label}</span>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value ?? 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition',
              active
                ? 'border-primary-700 bg-primary-700 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:text-primary-700'
            )}
          >
            {o.label}{' '}
            <span className={active ? 'text-white/80' : 'text-gray-400'}>
              {o.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function IntroCard({ text }: { text: string }) {
  return (
    <Card className="border-primary-100 bg-gray-50">
      <CardContent className="flex gap-4 p-5">
        <i
          aria-hidden="true"
          className="ri-information-line mt-0.5 text-xl text-primary-700"
        />
        <p className="text-sm leading-relaxed text-gray-700">{text}</p>
      </CardContent>
    </Card>
  );
}
