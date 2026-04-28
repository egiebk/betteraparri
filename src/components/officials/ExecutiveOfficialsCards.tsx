import { Card, CardContent, CardHeader } from '@bettergov/kapwa/card';
import mayorImage from '../../assets/mayor.jpg';
import { useState } from 'react';

type ExecutiveData = {
  MAYOR?: string;
  MAYOR_EMAIL?: string;
  MAYOR_IMAGE?: string;
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
    <Card hoverable className="overflow-hidden rounded-xl shadow-sm">
      <CardHeader className="bg-gray-50 p-5 sm:px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary-700">
              Office of the Municipal Mayor
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              {name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm text-primary-800">
                <i className="ri-building-line mr-2 h-4 w-4" />
                {position}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 p-5 sm:px-6">
        <div className="">
          <p className="text-sm leading-6 text-slate-700 sm:text-base">
            As Municipal Mayor, {name} leads the local government unit of
            Aparri, overseeing the delivery of public services, implementation
            of local programs, and community welfare initiatives. The Mayor's
            office is responsible for ensuring effective governance, fostering
            economic development, and promoting the well-being of all residents
            in Aparri. For official matters, invitations, or concerns addressed
            to the Mayor, please prepare the event or request details and send
            them to the Office of the Municipal Mayor using the contact
            information provided below.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl">
            <div className="flex items-center gap-3">
              <i className="ri-map-pin-line h-4 w-4 text-primary-700" />
              <div>
                <p className="text-[11px] font-light uppercase text-slate-500">
                  Office Address
                </p>
                <p className="mt-1 text-sm text-slate-800 sm:text-base">
                  {address || 'Address not yet available'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl">
            <div className="flex items-start gap-3">
              <i className="ri-mail-line mt-0.5 h-4 w-4 text-primary-700" />
              <div>
                <p className="text-[11px] font-light uppercase text-slate-500">
                  Email Address
                </p>
                <p className="mt-1 break-all text-sm text-slate-800 sm:text-base">
                  {email ? (
                    <a
                      href={`mailto:${email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {email}
                    </a>
                  ) : (
                    'Email not yet available'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MayorPhoto({ name, imageSrc }: { name: string; imageSrc?: string }) {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedImageSrc = imageSrc || mayorImage;
  const showImage = resolvedImageSrc && !hasImageError;

  return (
    <figure className="overflow-hidden rounded-xl border border-slate-200 bg-gray-50 shadow-sm">
      <div className="aspect-[4/5] w-full">
        {showImage ? (
          <img
            src={resolvedImageSrc}
            alt={`Portrait of ${name}`}
            className="h-full w-full object-cover"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-primary-50 px-6 text-center text-primary-700">
            <i
              className="ri-user-star-line inline-flex h-16 w-16 items-center justify-center text-7xl leading-none"
              aria-hidden="true"
            />
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.12em]">
              Mayor's Portrait
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{name}</p>
          </div>
        )}
      </div>
      <figcaption className="border-t border-slate-200 px-5 py-4">
        <p className="text-sm font-medium text-slate-900">Hon. {name}</p>
        <p className="mt-1 text-xs text-slate-500">Photo source: Mayor Dominador Ambo Dayag Facebook</p>
      </figcaption>
    </figure>
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
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      )}
      {description && (
        <p className="mt-2 max-w-3xl text-base text-slate-600">{description}</p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-start">
        <OfficialCard
          name={executive.MAYOR || 'Mayor'}
          position="Municipal Mayor"
          address={executive.MAYOR_ADDRESS || sharedOfficeAddress}
          email={executive.MAYOR_EMAIL || sharedOfficeEmail}
        />
        <MayorPhoto
          name={executive.MAYOR || 'Mayor'}
          imageSrc={executive.MAYOR_IMAGE}
        />
      </div>
    </div>
  );
}
