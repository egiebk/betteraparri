import { Link } from 'react-router-dom';
import { emergencyHotlines, formatPhone, telHref } from '../../data/hotlines';

/**
 * Red emergency hotline bar at the top of the sticky navbar, so the
 * numbers stay visible on every page while scrolling. On small screens
 * the numbers scroll sideways in one row to keep the bar one line tall.
 */
export default function HotlineBar() {
  return (
    <div
      role="region"
      aria-label="Emergency hotlines"
      className="bg-red-700 text-white"
    >
      <div className="container mx-auto flex h-9 items-center gap-3 px-4">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <i className="ri-phone-fill text-sm" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Emergency</span>
        </span>
        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {emergencyHotlines.map(item => (
            <li key={item.label} className="shrink-0">
              <a
                href={telHref(item.number)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <i className={`${item.icon} text-sm`} aria-hidden="true" />
                <span className="font-medium">{item.label}</span>
                <span className="font-mono font-semibold">
                  {formatPhone(item.number)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        <Link
          to="/hotlines"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
        >
          All<span className="hidden sm:inline">&nbsp;hotlines</span>
          <i className="ri-arrow-right-line" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
