import { Button } from '@bettergov/kapwa/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@bettergov/kapwa/card';

type ExecutiveData = {
  MAYOR?: string;
  MAYOR_EMAIL?: string;
  MAYOR_ADDRESS?: string;
  OFFICE_EMAIL?: string;
  OFFICE_ADDRESS?: string;
};

interface ExecutiveOfficialsCardsProps {
  title?: string;
  description?: string;
  data?: Record<string, unknown>;
}

function OfficialCard({
  name,
  position,
  address,
  email,
}: {
  name: string;
  position: string;
  address?: string;
  email?: string;
}) {
  return (
    <Card hoverable className="overflow-hidden rounded-[1.5rem] shadow-sm">
      <CardHeader className="px-5 py-5 sm:px-6">
        <h3 className="text-xl font-semibold leading-tight text-slate-900 sm:text-2xl">
          {name}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-800 sm:text-sm">
            <i className="ri-building-line mr-2 h-3.5 w-3.5" />
            {position}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-5 py-5 sm:px-6">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <i className="ri-map-pin-line mt-0.5 h-4 w-4 text-primary-700" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Location / Address
              </p>
              <p className="mt-1 text-sm text-slate-800 sm:text-base">
                {address || 'Address not yet available'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <i className="ri-mail-line mt-0.5 h-4 w-4 text-primary-700" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Email Address
              </p>
              <p className="mt-1 break-all text-sm text-slate-800 sm:text-base">
                {email || 'Email not yet available'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-0 sm:px-6">
        <Button
          type="button"
          size="md"
          fullWidth
          className="rounded-xl"
          disabled={!email}
          onClick={() => {
            if (email) {
              window.location.href = `mailto:${email}`;
            }
          }}
        >
          Send an Email
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ExecutiveOfficialsCards({
  title,
  description,
  data,
}: ExecutiveOfficialsCardsProps) {
  const executive = (data ?? {}) as ExecutiveData;
  const sharedOfficeAddress = executive.OFFICE_ADDRESS;
  const sharedOfficeEmail = executive.OFFICE_EMAIL;

  return (
    <div className="pb-4">
      {title && (
        <h2 className="text-4xl font-semibold text-slate-900">{title}</h2>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-base text-slate-600">{description}</p>
      )}

      <div className="mt-6 grid max-w-xl grid-cols-1 gap-5">
        <OfficialCard
          name={executive.MAYOR || 'Mayor'}
          position="Municipal Mayor"
          address={executive.MAYOR_ADDRESS || sharedOfficeAddress}
          email={executive.MAYOR_EMAIL || sharedOfficeEmail}
        />
      </div>
    </div>
  );
}
