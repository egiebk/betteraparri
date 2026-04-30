import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@bettergov/kapwa/button';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#0f47b8] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_34%),linear-gradient(135deg,_#1849b2_0%,_#0d3794_100%)]" />
      <div className="relative container mx-auto px-4 py-18 md:py-16 lg:py-24">
        <div className="flex items-center max-w-7xl mx-auto lg:flex-row">
          <div className="">
            <p className="text-md font-light tracking-tight text-white lg:text-lg">
              Welcome to
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-4xl lg:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="mt-4 max-w text-base leading-8 text-blue-50 sm:text-lg">
              {t('hero.subtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                className="justify-center bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-2xl px-6 py-3.5 text-base font-semibold shadow-xl"
                onClick={() => navigate('/services')}
              >
                <i className="ri-arrow-right-line mr-2" />
                {t('hero.browseServices')}
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
