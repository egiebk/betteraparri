import { useEffect, useState } from 'react';

type NullableNumber = number | null;

type OpenMeteoCurrent = {
  time?: string;
  temperature_2m?: number;
  relative_humidity_2m?: number;
  apparent_temperature?: number;
  precipitation?: number;
  weather_code?: number;
  cloud_cover?: number;
  pressure_msl?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  wind_gusts_10m?: number;
};

type OpenMeteoDaily = {
  time?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_sum?: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max?: number[];
  wind_gusts_10m_max?: number[];
  uv_index_max?: number[];
  et0_fao_evapotranspiration?: number[];
  shortwave_radiation_sum?: number[];
};

type OpenMeteoForecastResponse = {
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
};

type OpenMeteoMarineCurrent = {
  time?: string;
  wave_height?: number;
  wave_period?: number;
  sea_surface_temperature?: number;
};

type OpenMeteoMarineDaily = {
  wave_height_max?: number[];
  wave_period_max?: number[];
};

type OpenMeteoMarineResponse = {
  current?: OpenMeteoMarineCurrent;
  daily?: OpenMeteoMarineDaily;
};

type WeatherSnapshot = {
  time: string;
  temperature: number;
  humidity: NullableNumber;
  apparentTemperature: NullableNumber;
  precipitation: NullableNumber;
  weatherCode: NullableNumber;
  cloudCover: NullableNumber;
  pressure: NullableNumber;
  windDirection: NullableNumber;
  windGusts: NullableNumber;
  windSpeed: NullableNumber;
};

type DailyOutlook = {
  date: string;
  weatherCode: NullableNumber;
  temperatureMax: NullableNumber;
  temperatureMin: NullableNumber;
  precipitation: NullableNumber;
  precipitationProbability: NullableNumber;
  windSpeed: NullableNumber;
  windGusts: NullableNumber;
  uvIndex: NullableNumber;
  evapotranspiration: NullableNumber;
  solarRadiation: NullableNumber;
};

type MarineSnapshot = {
  time: string;
  waveHeight: NullableNumber;
  wavePeriod: NullableNumber;
  waveHeightMax: NullableNumber;
  wavePeriodMax: NullableNumber;
};

type ClimateSnapshot = {
  weather: WeatherSnapshot;
  outlook: DailyOutlook[];
  marine: MarineSnapshot;
};

type WeatherCodeInfo = {
  label: string;
  icon: string;
};

type Advisory = {
  audience: string;
  icon: string;
  status: string;
  tone: string;
  details: string[];
};

const LOCATION = {
  name: 'Aparri, Cagayan',
  latitude: 18.3566,
  longitude: 121.6406,
};

const CURRENT_WEATHER_VARIABLES = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
];

const DAILY_WEATHER_VARIABLES = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_gusts_10m_max',
  'uv_index_max',
  'et0_fao_evapotranspiration',
  'shortwave_radiation_sum',
];

const CURRENT_MARINE_VARIABLES = [
  'wave_height',
  'wave_period',
  'sea_surface_temperature',
];

const DAILY_MARINE_VARIABLES = ['wave_height_max', 'wave_period_max'];

const WEATHER_CODE_LOOKUP: Record<number, WeatherCodeInfo> = {
  0: { label: 'Clear sky', icon: 'ri-sun-line' },
  1: { label: 'Mainly clear', icon: 'ri-sun-cloudy-line' },
  2: { label: 'Partly cloudy', icon: 'ri-sun-cloudy-line' },
  3: { label: 'Overcast', icon: 'ri-cloudy-line' },
  45: { label: 'Fog', icon: 'ri-mist-line' },
  48: { label: 'Rime fog', icon: 'ri-mist-line' },
  51: { label: 'Light drizzle', icon: 'ri-drizzle-line' },
  53: { label: 'Moderate drizzle', icon: 'ri-drizzle-line' },
  55: { label: 'Dense drizzle', icon: 'ri-drizzle-line' },
  61: { label: 'Slight rain', icon: 'ri-rainy-line' },
  63: { label: 'Moderate rain', icon: 'ri-rainy-line' },
  65: { label: 'Heavy rain', icon: 'ri-heavy-showers-line' },
  80: { label: 'Rain showers', icon: 'ri-showers-line' },
  81: { label: 'Moderate showers', icon: 'ri-showers-line' },
  82: { label: 'Heavy showers', icon: 'ri-heavy-showers-line' },
  95: { label: 'Thunderstorm', icon: 'ri-thunderstorms-line' },
  96: { label: 'Thunderstorm with hail', icon: 'ri-thunderstorms-line' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'ri-thunderstorms-line' },
};

const getWeatherInfo = (weatherCode: NullableNumber): WeatherCodeInfo => {
  if (weatherCode === null) {
    return { label: 'Current forecast', icon: 'ri-cloud-line' };
  }

  return (
    WEATHER_CODE_LOOKUP[weatherCode] ?? {
      label: 'Current conditions',
      icon: 'ri-cloud-line',
    }
  );
};

const readNumber = (value: unknown): NullableNumber => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const formatNumber = (value: NullableNumber | undefined, fallback = '--') => {
  if (typeof value !== 'number') return fallback;

  return Math.round(value).toString();
};

const formatDecimal = (
  value: NullableNumber | undefined,
  digits = 1,
  fallback = '--'
) => {
  if (typeof value !== 'number') return fallback;

  return value.toFixed(digits);
};

const formatUpdatedAt = (time: string | null | undefined) => {
  if (!time) return 'Live forecast from Open-Meteo';

  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date(time));
};

const getWeatherApiUrl = () => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_WEATHER_VARIABLES.join(','),
    daily: DAILY_WEATHER_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: '3',
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
};

const getMarineApiUrl = () => {
  const params = new URLSearchParams({
    latitude: LOCATION.latitude.toString(),
    longitude: LOCATION.longitude.toString(),
    current: CURRENT_MARINE_VARIABLES.join(','),
    daily: DAILY_MARINE_VARIABLES.join(','),
    timezone: 'Asia/Manila',
    forecast_days: '3',
    cell_selection: 'sea',
  });

  return `https://marine-api.open-meteo.com/v1/marine?${params.toString()}`;
};

const firstValue = (values: number[] | undefined): NullableNumber => {
  return readNumber(values?.[0]);
};

const buildDailyOutlook = (daily: OpenMeteoDaily | undefined) => {
  const times = daily?.time ?? [];

  return times.slice(0, 3).map((date, index) => ({
    date,
    weatherCode: readNumber(daily?.weather_code?.[index]),
    temperatureMax: readNumber(daily?.temperature_2m_max?.[index]),
    temperatureMin: readNumber(daily?.temperature_2m_min?.[index]),
    precipitation: readNumber(daily?.precipitation_sum?.[index]),
    precipitationProbability: readNumber(
      daily?.precipitation_probability_max?.[index]
    ),
    windSpeed: readNumber(daily?.wind_speed_10m_max?.[index]),
    windGusts: readNumber(daily?.wind_gusts_10m_max?.[index]),
    uvIndex: readNumber(daily?.uv_index_max?.[index]),
    evapotranspiration: readNumber(daily?.et0_fao_evapotranspiration?.[index]),
    solarRadiation: readNumber(daily?.shortwave_radiation_sum?.[index]),
  }));
};

const getHeatLevel = (apparentTemperature: NullableNumber) => {
  if (typeof apparentTemperature !== 'number') return 'Check again later';
  if (apparentTemperature >= 40) return 'Very hot outside';
  if (apparentTemperature >= 33) return 'Hot outside';

  return 'Comfortable weather';
};

const getRainLevel = (
  precipitationProbability: NullableNumber,
  precipitation: NullableNumber
) => {
  if (
    (typeof precipitationProbability === 'number' &&
      precipitationProbability >= 70) ||
    (typeof precipitation === 'number' && precipitation >= 20)
  ) {
    return 'Bring an umbrella';
  }

  if (
    (typeof precipitationProbability === 'number' &&
      precipitationProbability >= 40) ||
    (typeof precipitation === 'number' && precipitation >= 5)
  ) {
    return 'Possible rain today';
  }

  return 'Low chance of rain';
};

const getSeaLevel = (waveHeight: NullableNumber, windGusts: NullableNumber) => {
  if (
    (typeof waveHeight === 'number' && waveHeight >= 2.5) ||
    (typeof windGusts === 'number' && windGusts >= 45)
  ) {
    return 'Avoid small boats';
  }

  if (
    (typeof waveHeight === 'number' && waveHeight >= 1.5) ||
    (typeof windGusts === 'number' && windGusts >= 30)
  ) {
    return 'Take extra care at sea';
  }

  return 'Sea looks manageable';
};

const getFarmLevel = (
  rainChance: NullableNumber,
  evapotranspiration: NullableNumber
) => {
  if (typeof rainChance === 'number' && rainChance >= 70) {
    return 'Not good for drying crops';
  }

  if (typeof evapotranspiration === 'number' && evapotranspiration >= 5) {
    return 'Crops may need more water';
  }

  return 'Good day for regular farm work';
};

const buildAdvisories = (
  snapshot: ClimateSnapshot | null,
  hasError: boolean
): Advisory[] => {
  if (hasError || !snapshot) {
    return [
      {
        audience: 'General Public',
        icon: 'ri-community-line',
        status: 'No live update right now',
        tone: 'border-slate-200 bg-white',
        details: ['Check local announcements before going out.'],
      },
      {
        audience: 'Fisherfolk',
        icon: 'ri-ship-2-line',
        status: 'Check before sailing',
        tone: 'border-slate-200 bg-white',
        details: ['Sea condition data could not be loaded at this time.'],
      },
      {
        audience: 'Farmers',
        icon: 'ri-seedling-line',
        status: 'Use local rain reports',
        tone: 'border-slate-200 bg-white',
        details: ['Check nearby fields before watering, spraying, or drying.'],
      },
    ];
  }

  const today = snapshot.outlook[0];
  const heatLevel = getHeatLevel(snapshot.weather.apparentTemperature);
  const rainLevel = getRainLevel(
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null
  );
  const seaLevel = getSeaLevel(
    snapshot.marine.waveHeightMax ?? snapshot.marine.waveHeight,
    snapshot.weather.windGusts
  );
  const farmLevel = getFarmLevel(
    today?.precipitationProbability ?? null,
    today?.evapotranspiration ?? null
  );

  return [
    {
      audience: 'General Public',
      icon: 'ri-community-line',
      status: `${heatLevel}. ${rainLevel}.`,
      tone:
        heatLevel === 'Very hot outside' || rainLevel === 'Bring an umbrella'
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-200 bg-white',
      details: [
        `It may feel like ${formatNumber(snapshot.weather.apparentTemperature)}°C when you are outside.`,
        `Bring water and stay in the shade when possible. Rain chance is ${formatNumber(today?.precipitationProbability)}%.`,
      ],
    },
    {
      audience: 'Fisherfolk',
      icon: 'ri-ship-2-line',
      status: seaLevel,
      tone:
        seaLevel === 'Avoid small boats'
          ? 'border-rose-200 bg-rose-50'
          : 'border-slate-200 bg-white',
      details: [
        `Waves may reach around ${formatDecimal(snapshot.marine.waveHeightMax)} meters today.`,
        `Strong wind is possible. Check the shore and local announcements before going out to sea.`,
      ],
    },
    {
      audience: 'Farmers',
      icon: 'ri-seedling-line',
      status: farmLevel,
      tone:
        farmLevel === 'Crops may need more water'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-slate-200 bg-white',
      details: [
        `Rain chance today is ${formatNumber(today?.precipitationProbability)}%.`,
        `If the soil is dry, check if plants need watering, especially during hot hours.`,
      ],
    },
  ];
};

function ClimateMetric({
  icon,
  label,
  value,
  helper,
}: {
  icon: string;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
      <i
        className={`${icon} inline-flex h-5 w-5 items-center justify-center text-blue-200 leading-none`}
        aria-hidden="true"
      />
      <p className="mt-3 text-sm text-blue-100">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-blue-100">{helper}</p>}
    </div>
  );
}

function AdvisoryCard({ advisory }: { advisory: Advisory }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${advisory.tone}`}>
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <i
            className={`${advisory.icon} inline-flex h-5 w-5 items-center justify-center leading-none`}
            aria-hidden="true"
          />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {advisory.audience}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-700">
            {advisory.status}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
        {advisory.details.map(detail => (
          <p key={detail}>{detail}</p>
        ))}
      </div>
    </article>
  );
}

export default function WeatherLocationSection() {
  const [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchClimateData = async () => {
      try {
        const [weatherResponse, marineResponse] = await Promise.all([
          fetch(getWeatherApiUrl(), { signal: abortController.signal }),
          fetch(getMarineApiUrl(), { signal: abortController.signal }),
        ]);

        if (!weatherResponse.ok || !marineResponse.ok) {
          throw new Error('Unable to load climate data');
        }

        const weatherData =
          (await weatherResponse.json()) as OpenMeteoForecastResponse;
        const marineData =
          (await marineResponse.json()) as OpenMeteoMarineResponse;
        const current = weatherData.current;

        if (!current || typeof current.temperature_2m !== 'number') {
          throw new Error('Weather response is missing current conditions');
        }

        setSnapshot({
          weather: {
            time: current.time ?? '',
            temperature: current.temperature_2m,
            humidity: readNumber(current.relative_humidity_2m),
            apparentTemperature: readNumber(current.apparent_temperature),
            precipitation: readNumber(current.precipitation),
            weatherCode: readNumber(current.weather_code),
            cloudCover: readNumber(current.cloud_cover),
            pressure: readNumber(current.pressure_msl),
            windDirection: readNumber(current.wind_direction_10m),
            windGusts: readNumber(current.wind_gusts_10m),
            windSpeed: readNumber(current.wind_speed_10m),
          },
          outlook: buildDailyOutlook(weatherData.daily),
          marine: {
            time: marineData.current?.time ?? '',
            waveHeight: readNumber(marineData.current?.wave_height),
            wavePeriod: readNumber(marineData.current?.wave_period),
            waveHeightMax: firstValue(marineData.daily?.wave_height_max),
            wavePeriodMax: firstValue(marineData.daily?.wave_period_max),
          },
        });
        setHasError(false);
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          setHasError(true);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchClimateData();

    return () => {
      abortController.abort();
    };
  }, []);

  const weather = snapshot?.weather;
  const today = snapshot?.outlook[0];
  const marine = snapshot?.marine;
  const condition = getWeatherInfo(weather?.weatherCode ?? null);
  const advisories = buildAdvisories(snapshot, hasError);

  return (
    <section className="border-y border-slate-200 bg-slate-100 py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 max-w-3xl">
          <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Weather Advisory
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            A quick guide to help residents, fisherfolk, and farmers decide what
            to prepare for today.
          </p>
        </div>

        <div className="rounded-3xl bg-primary-700 p-6 text-white shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <p className="text-lg font-semibold text-blue-100">
                {LOCATION.name}
              </p>
              <div className="mt-4 flex items-start gap-3">
                <span className="text-7xl font-bold leading-none tracking-normal sm:text-8xl">
                  {formatNumber(weather?.temperature)}
                </span>
                <span className="pt-2 text-3xl font-semibold text-blue-100">
                  °C
                </span>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <i
                  className={`${condition.icon} inline-flex mr-4 h-12 w-12 items-center justify-center text-6xl text-blue-100 leading-none`}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xl font-semibold text-white">
                    {hasError ? 'Climate data unavailable' : condition.label}
                  </p>
                  <p className="mt-1 text-xs text-blue-100">
                    {hasError
                      ? 'Please check again shortly.'
                      : `as of ${formatUpdatedAt(weather?.time)}`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-5 text-sm text-blue-100">
                <span>Clouds: {formatNumber(weather?.cloudCover)}%</span>
                <span>Humidity: {formatNumber(weather?.humidity)}%</span>
                <span>
                  Rain now: {formatDecimal(weather?.precipitation)} mm
                </span>
              </div>

              {isLoading && (
                <div className="mt-8 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/20">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-white/70" />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ClimateMetric
                  icon="ri-temp-hot-line"
                  label="How hot it feels"
                  value={`${formatNumber(weather?.apparentTemperature)}°C`}
                  helper="Use this for outdoor errands."
                />
                <ClimateMetric
                  icon="ri-rainy-line"
                  label="Chance of rain"
                  value={`${formatNumber(today?.precipitationProbability)}%`}
                  helper="Higher means bring rain gear."
                />
                <ClimateMetric
                  icon="ri-windy-line"
                  label="Strongest wind"
                  value={`${formatNumber(weather?.windGusts)} km/h`}
                  helper="Useful for boats and outdoor work."
                />
                <ClimateMetric
                  icon="ri-ship-2-line"
                  label="Possible waves"
                  value={`${formatDecimal(marine?.waveHeightMax)} m`}
                  helper="For fisherfolk and coastal trips."
                />
                <ClimateMetric
                  icon="ri-sun-line"
                  label="UV index"
                  value={formatDecimal(today?.uvIndex)}
                  helper="Use shade when this is high."
                />
                <ClimateMetric
                  icon="ri-water-percent-line"
                  label="Humidity"
                  value={`${formatNumber(weather?.humidity)}%`}
                  helper="High humidity makes heat feel heavier."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {advisories.map(advisory => (
            <AdvisoryCard key={advisory.audience} advisory={advisory} />
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Data provided by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-700 underline"
            >
              Open-Meteo
            </a>
            . For official updates and warnings, please refer to local and
            national government announcements.
          </p>
        </div>
      </div>
    </section>
  );
}
