/**
 * Lightweight, dependency-free line chart for multi-year fiscal trends.
 *
 * Renders up to 2 series as an accessible inline SVG: thin 2px lines,
 * rounded data-end markers, a legend when there are 2 series, native
 * <title> tooltips on each point, and a visually-available data table
 * as a fallback for screen readers / non-visual access.
 *
 * Optional props:
 * - `invertY`: plot lower values higher (useful for ranks, where 1st is best).
 * - `null` values: rendered as gaps (no point, line breaks) and "—" in the table.
 */

interface TrendSeries {
  label: string;
  color: string;
  values: (number | null)[];
}

interface TrendChartProps {
  years: number[];
  series: TrendSeries[];
  unit?: string;
  formatValue?: (value: number) => string;
  className?: string;
  invertY?: boolean;
  ariaLabel?: string;
}

const WIDTH = 640;
const HEIGHT = 260;
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 };

export default function TrendChart({
  years,
  series,
  unit = 'PHP M',
  formatValue,
  className = '',
  invertY = false,
  ariaLabel,
}: TrendChartProps) {
  const format = formatValue ?? (v => v.toLocaleString());
  const allValues = series.flatMap(s =>
    s.values.filter((v): v is number => v !== null)
  );
  const maxValue = Math.max(...allValues, 0);
  const niceStep = invertY && maxValue > 200 ? 100 : 10;
  const niceMax =
    maxValue === 0 ? 1 : Math.ceil(maxValue / niceStep) * niceStep;

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (index: number) =>
    PADDING.left +
    (years.length <= 1 ? 0 : (plotWidth * index) / (years.length - 1));
  const yFor = (value: number) =>
    invertY
      ? PADDING.top + (plotHeight * value) / niceMax
      : PADDING.top + plotHeight - (plotHeight * value) / niceMax;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={
          ariaLabel ??
          `Line chart showing ${series.map(s => s.label).join(' and ')} by year, in ${unit}`
        }
        className="w-full h-auto"
      >
        {/* Recessive gridlines */}
        {gridLines.map(fraction => {
          const y = PADDING.top + plotHeight * (1 - fraction);
          return (
            <line
              key={fraction}
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {/* Y-axis labels */}
        {gridLines.map(fraction => {
          const value = invertY ? niceMax * (1 - fraction) : niceMax * fraction;
          const y = PADDING.top + plotHeight * (1 - fraction);
          return (
            <text
              key={fraction}
              x={PADDING.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
            >
              {format(value)}
            </text>
          );
        })}

        {/* X-axis year labels */}
        {years.map((year, index) => (
          <text
            key={year}
            x={xFor(index)}
            y={HEIGHT - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#6b7280"
          >
            {year}
          </text>
        ))}

        {/* Series lines + points */}
        {series.map(s => {
          // Split into contiguous runs so null values render as gaps.
          const runs: string[][] = [];
          let current: string[] = [];
          s.values.forEach((v, i) => {
            if (v === null) {
              if (current.length > 0) runs.push(current);
              current = [];
            } else {
              current.push(`${xFor(i)},${yFor(v)}`);
            }
          });
          if (current.length > 0) runs.push(current);
          return (
            <g key={s.label}>
              {runs.map(run => (
                <polyline
                  key={run[0]}
                  points={run.join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {s.values.map((v, i) =>
                v === null ? null : (
                  <circle
                    key={i}
                    cx={xFor(i)}
                    cy={yFor(v)}
                    r={4}
                    fill={s.color}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  >
                    <title>
                      {s.label}, {years[i]}: {format(v)} {unit}
                    </title>
                  </circle>
                )
              )}
            </g>
          );
        })}
      </svg>

      {series.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-2">
          {series.map(s => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden="true"
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <details className="mt-2">
        <summary className="text-xs text-gray-500 cursor-pointer">
          View as table
        </summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1 pr-4 border-b border-gray-200">
                  Year
                </th>
                {series.map(s => (
                  <th
                    key={s.label}
                    className="text-right py-1 pl-4 border-b border-gray-200"
                  >
                    {s.label} ({unit})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((year, i) => (
                <tr key={year}>
                  <td className="py-1 pr-4 border-b border-gray-100">{year}</td>
                  {series.map(s => (
                    <td
                      key={s.label}
                      className="text-right py-1 pl-4 border-b border-gray-100"
                    >
                      {s.values[i] === null || s.values[i] === undefined
                        ? '—'
                        : format(s.values[i] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
