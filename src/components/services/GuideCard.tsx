import { Link } from 'react-router-dom';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { cn } from '../../lib/utils';
import { guideHref, type ServiceGuide } from '../../data/serviceGuides';

/** Card linking to a plain-language guide, with its fee and time. */
export default function GuideCard({ guide }: { guide: ServiceGuide }) {
  return (
    <Link to={guideHref(guide)} className="group block h-full">
      <Card
        hoverable
        className="card-fade-in h-full border-t-4 border-emerald-500"
      >
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"
            >
              <i className={cn(guide.icon, 'text-lg')} />
            </span>
            <h3 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-primary-700">
              {guide.title}
            </h3>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
            {guide.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
              <i aria-hidden="true" className="ri-money-dollar-circle-line" />
              {guide.fee.label}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
              <i aria-hidden="true" className="ri-time-line" />
              {guide.time.label}
            </span>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary-700">
            Read the guide
            <i
              aria-hidden="true"
              className="ri-arrow-right-line transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
