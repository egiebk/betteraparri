import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@bettergov/kapwa/button';
import { Card, CardContent } from '@bettergov/kapwa/card';
import { Input } from '@bettergov/kapwa/input';
import { Label } from '@bettergov/kapwa/label';

const popularServices = ['birthCertificate', 'businessPermit'] as const;

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim();
  const contactHref = contactEmail
    ? `mailto:${contactEmail}`
    : '/government/officials';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/services');
  };

  return (
    <section className="relative overflow-hidden bg-[#0f47b8] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_34%),linear-gradient(135deg,_#1849b2_0%,_#0d3794_100%)]" />
      <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-18">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="max-w-3xl">
            <p className="text-md font-light tracking-tight text-white lg:text-lg">
              Welcome to
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-4xl lg:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-blue-50 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="justify-center bg-emerald-600 text-white-50 hover:bg-primary-700 rounded-2xl px-6 py-3.5 text-base font-semibold shadow-xl"
                onClick={() => navigate('/services')}
              >
                <i className="ri-arrow-right-line mr-2" />
                {t('hero.browseServices')}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="justify-center rounded-2xl border-white/80 bg-transparent px-6 py-3.5 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                onClick={() => {
                  if (contactEmail) {
                    window.location.href = contactHref;
                    return;
                  }
                  navigate('/government/officials');
                }}
              >
                {t('hero.contactUs')}
              </Button>
            </div>
          </div>

          {/* <Card className="rounded-[1.75rem] border-0 bg-white text-slate-900 shadow-[0_28px_80px_rgba(4,16,48,0.28)]">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                <i className="ri-search-line h-5 w-5 text-[#1849b2]" />
                <span>{t('hero.findService')}</span>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <Label className="sr-only" htmlFor="hero-service-search">
                  {t('hero.findService')}
                </Label>
                <Input
                  id="hero-service-search"
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="min-h-14 flex-1 rounded-2xl border-slate-200 px-5 text-lg text-slate-900"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="min-h-14 rounded-2xl px-5 shadow-[0_14px_32px_rgba(24,73,178,0.3)]"
                >
                  <i className="ri-arrow-right-line h-6 w-6" />
                  <span className="sr-only">{t('hero.findService')}</span>
                </Button>
              </form>

              <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-medium text-slate-500">
                  {t('hero.popular')}
                </span>
                {popularServices.map(key => (
                  <Button
                    key={key}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-[#1849b2] hover:bg-slate-200 hover:text-[#1849b2]"
                    onClick={() => setQuery(t(`hero.${key}`))}
                  >
                    {t(`hero.${key}`)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </section>
  );
}
