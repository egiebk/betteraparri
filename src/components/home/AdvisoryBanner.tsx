import { Link } from 'react-router-dom';
import { getActiveAdvisories } from '../../data/updates';

/**
 * Shown at the very top of the homepage only while there is an active
 * warning or urgent advisory (see getActiveAdvisories). Renders nothing
 * otherwise. Each advisory links to its card on the Updates page.
 */
export default function AdvisoryBanner() {
  const advisories = getActiveAdvisories().slice(0, 2);
  if (advisories.length === 0) return null;

  return (
    <div role="region" aria-label="Active advisories" className="print:hidden">
      {advisories.map(advisory => {
        const urgent = advisory.severity === 'urgent';
        return (
          <div
            key={advisory.id}
            className={
              urgent
                ? 'border-b border-red-900 bg-red-900 text-white'
                : 'border-b border-amber-300 bg-amber-100 text-amber-950'
            }
          >
            <div className="container mx-auto flex flex-col gap-1 px-4 py-2.5 text-sm sm:flex-row sm:items-center sm:gap-3">
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                <i
                  aria-hidden="true"
                  className={
                    urgent ? 'ri-alarm-warning-fill' : 'ri-error-warning-fill'
                  }
                />
                {urgent ? 'Urgent advisory' : 'Advisory'}
              </span>
              <p className="min-w-0 flex-1 font-semibold">{advisory.title}</p>
              <Link
                to={`/updates#${advisory.id}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold underline underline-offset-4"
              >
                Read more
                <i aria-hidden="true" className="ri-arrow-right-line" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
