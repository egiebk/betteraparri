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

type AdvisoryDetail = {
  label: string;
  bullets: string[];
};

type Advisory = {
  audience: string;
  icon: string;
  status: string;
  tone: string;
  details: AdvisoryDetail[];
};

type RiskLevel = 'low' | 'watch' | 'caution' | 'high';

type RiskAssessment = {
  level: RiskLevel;
  status: string;
  detail: string;
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

const formatDayLabel = (date: string, index: number) => {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  return new Intl.DateTimeFormat('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

const getUvLevel = (uvIndex: NullableNumber) => {
  if (typeof uvIndex !== 'number') return 'Check UV';
  if (uvIndex >= 11) return 'Extreme';
  if (uvIndex >= 8) return 'Very high';
  if (uvIndex >= 6) return 'High';
  if (uvIndex >= 3) return 'Moderate';

  return 'Low';
};

const getWindDirection = (degrees: NullableNumber) => {
  if (typeof degrees !== 'number') return '--';

  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % directions.length;

  return directions[index];
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

const riskRank: Record<RiskLevel, number> = {
  low: 0,
  watch: 1,
  caution: 2,
  high: 3,
};

const getHighestRisk = (...levels: RiskLevel[]) => {
  return levels.reduce<RiskLevel>((highest, level) => {
    return riskRank[level] > riskRank[highest] ? level : highest;
  }, 'low');
};

const getRiskTone = (level: RiskLevel) => {
  if (level === 'high') return 'border-rose-200 bg-rose-50';
  if (level === 'caution') return 'border-amber-200 bg-amber-50';
  if (level === 'watch') return 'border-sky-200 bg-sky-50';

  return 'border-slate-200 bg-white';
};

const isStormCode = (weatherCode: NullableNumber) => {
  return typeof weatherCode === 'number' && weatherCode >= 95;
};

const isHeavyRainCode = (weatherCode: NullableNumber) => {
  return [65, 82, 96, 99].includes(weatherCode ?? -1);
};

const assessHeat = (
  apparentTemperature: NullableNumber,
  humidity: NullableNumber
): RiskAssessment => {
  if (typeof apparentTemperature !== 'number') {
    return {
      level: 'watch',
      status: 'Check heat conditions',
      detail: 'Heat index is unavailable. Use the actual temperature instead.',
    };
  }

  const humidHeat =
    typeof humidity === 'number' && humidity >= 80 && apparentTemperature >= 32;

  if (apparentTemperature >= 42) {
    return {
      level: 'high',
      status: 'Dangerous heat',
      detail:
        'Avoid all outdoor work. Use shade, drink water often, and take rest breaks.',
    };
  }

  if (apparentTemperature >= 37 || humidHeat) {
    return {
      level: 'caution',
      status: 'High heat stress',
      detail:
        'Limit outdoor work to early morning or late afternoon. Use shade and drink water often.',
    };
  }

  if (apparentTemperature >= 32) {
    return {
      level: 'watch',
      status: 'Warm conditions',
      detail: 'Do heavy errands in the morning or late afternoon.',
    };
  }

  return {
    level: 'low',
    status: 'Comfortable heat level',
    detail: 'Heat risk is low, but bring water for long outdoor trips.',
  };
};

const assessRain = (
  precipitationProbability: NullableNumber,
  precipitation: NullableNumber,
  weatherCode: NullableNumber
): RiskAssessment => {
  const probability = precipitationProbability ?? 0;
  const rainTotal = precipitation ?? 0;

  if (
    isStormCode(weatherCode) ||
    isHeavyRainCode(weatherCode) ||
    probability >= 80 ||
    rainTotal >= 30
  ) {
    return {
      level: 'high',
      status: 'Heavy rain or thunderstorm risk',
      detail: 'Expect downpours or lightning. Avoid flood-prone areas.',
    };
  }

  if (probability >= 60 || rainTotal >= 15) {
    return {
      level: 'caution',
      status: 'Likely rain today',
      detail: 'Bring rain gear and keep documents or supplies covered.',
    };
  }

  if (probability >= 35 || rainTotal >= 3) {
    return {
      level: 'watch',
      status: 'Possible rain',
      detail: 'Plan outdoor work carefully. Rain may still interrupt errands.',
    };
  }

  return {
    level: 'low',
    status: 'Low rain risk',
    detail: 'Rain risk is low. Normal travel should be manageable.',
  };
};

const assessWind = (
  windSpeed: NullableNumber,
  windGusts: NullableNumber
): RiskAssessment => {
  const speed = windSpeed ?? 0;
  const gusts = windGusts ?? 0;

  if (gusts >= 50 || speed >= 35) {
    return {
      level: 'high',
      status: 'Strong wind risk',
      detail: 'Secure light materials, signs, tarps, and loose roofing.',
    };
  }

  if (gusts >= 35 || speed >= 25) {
    return {
      level: 'caution',
      status: 'Gusty conditions',
      detail:
        'Secure loose items and be cautious of falling branches or debris.',
    };
  }

  if (gusts >= 25 || speed >= 18) {
    return {
      level: 'watch',
      status: 'Breezy conditions',
      detail: 'Expect noticeable wind, especially in open or coastal areas.',
    };
  }

  return {
    level: 'low',
    status: 'Light to moderate wind',
    detail: 'Wind risk is low for most daily activities.',
  };
};

const assessSea = (
  waveHeight: NullableNumber,
  wavePeriod: NullableNumber,
  windGusts: NullableNumber
): RiskAssessment => {
  const waves = waveHeight ?? 0;
  const period = wavePeriod ?? 0;
  const gusts = windGusts ?? 0;
  const steepShortWaves = waves >= 1.2 && period > 0 && period <= 6;

  if (waves >= 2.5 || gusts >= 45 || (waves >= 2 && steepShortWaves)) {
    return {
      level: 'high',
      status: 'Avoid small boats',
      detail: 'Small craft may be unsafe. Wait for calmer conditions.',
    };
  }

  if (waves >= 1.5 || gusts >= 30 || steepShortWaves) {
    return {
      level: 'caution',
      status: 'Take extra care at sea',
      detail: 'Check shore conditions and local advisories before sailing.',
    };
  }

  if (waves >= 1 || gusts >= 25) {
    return {
      level: 'watch',
      status: 'Monitor sea conditions',
      detail: 'Stay alert near the coast. Conditions can change quickly.',
    };
  }

  return {
    level: 'low',
    status: 'Sea looks manageable',
    detail: 'Marine risk is low, but still check the shore before leaving.',
  };
};

const assessFarm = (
  rain: RiskAssessment,
  heat: RiskAssessment,
  rainChance: NullableNumber,
  precipitation: NullableNumber,
  evapotranspiration: NullableNumber,
  uvIndex: NullableNumber
): RiskAssessment => {
  const probability = rainChance ?? 0;
  const rainTotal = precipitation ?? 0;
  const waterDemand = evapotranspiration ?? 0;
  const uv = uvIndex ?? 0;

  if (rain.level === 'high' || probability >= 75 || rainTotal >= 20) {
    return {
      level: 'high',
      status: 'Delay drying and spraying',
      detail: 'Rain may affect drying, spraying, hauling, and harvest work.',
    };
  }

  if (rain.level === 'caution' || probability >= 55 || rainTotal >= 8) {
    return {
      level: 'caution',
      status: 'Protect drying crops',
      detail: 'Use cover or tarps. Avoid spraying if rain is near.',
    };
  }

  if (waterDemand >= 5 || heat.level === 'caution' || uv >= 8) {
    return {
      level: 'caution',
      status: 'Irrigation and heat caution',
      detail: 'Check soil moisture. Crops may need more water today.',
    };
  }

  if (waterDemand >= 3.5 || heat.level === 'watch' || uv >= 6) {
    return {
      level: 'watch',
      status: 'Good with water checks',
      detail: 'Regular work is okay. Check water needs before midday heat.',
    };
  }

  return {
    level: 'low',
    status: 'Good day for regular farm work',
    detail: 'Good for regular work, drying, and routine field checks.',
  };
};

const buildAdvisories = (
  snapshot: ClimateSnapshot | null,
  hasError: boolean
): Advisory[] => {
  if (hasError || !snapshot) {
    return [
      {
        audience: 'Commuters and Errands',
        icon: 'ri-community-line',
        status: 'No live update right now',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            label: 'What This Means',
            bullets: [
              'The live weather feed did not load.',
              'Current heat, rain, and wind conditions may be different from what is shown here.',
            ],
          },
          {
            label: 'What To Do',
            bullets: [
              'Check LGU, barangay, school, or transport announcements.',
              'Look at nearby road, river, and sky conditions before leaving.',
              'Use extra care for errands, school pickup, market trips, and outdoor work.',
            ],
          },
          {
            label: 'Weather Basis',
            bullets: ['No current weather reading was received.'],
          },
        ],
      },
      {
        audience: 'Fisherfolk and Coastal Travel',
        icon: 'ri-ship-2-line',
        status: 'Check before sailing',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            label: 'What This Means',
            bullets: [
              'The marine feed did not load.',
              'Wave height, wave timing, and coastal wind risk may be different from what is shown here.',
            ],
          },
          {
            label: 'What To Do',
            bullets: [
              'Check the shore, tide, and wind before loading a boat.',
              'Review Coast Guard, MDRRMO, or barangay advisories before leaving.',
              'Delay the trip if waves look rough or wind is getting stronger.',
            ],
          },
          {
            label: 'Weather Basis',
            bullets: ['No current marine reading was received.'],
          },
        ],
      },
      {
        audience: 'Farmers and Field Work',
        icon: 'ri-seedling-line',
        status: 'Use local rain reports',
        tone: 'border-slate-200 bg-white',
        details: [
          {
            label: 'What This Means',
            bullets: [
              'The farm planning feed did not load.',
              'Rain, UV, and crop water demand may be different from what is shown here.',
            ],
          },
          {
            label: 'What To Do',
            bullets: [
              'Use local rain reports and field observations.',
              'Inspect soil and crop conditions before watering, spraying, drying, or hauling.',
              'Adjust the day plan if nearby fields already received rain.',
            ],
          },
          {
            label: 'Weather Basis',
            bullets: ['No usable farm planning values were received.'],
          },
        ],
      },
    ];
  }

  const today = snapshot.outlook[0];
  const heatRisk = assessHeat(
    snapshot.weather.apparentTemperature,
    snapshot.weather.humidity
  );
  const rainRisk = assessRain(
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null,
    today?.weatherCode ?? snapshot.weather.weatherCode
  );
  const windRisk = assessWind(
    today?.windSpeed ?? snapshot.weather.windSpeed,
    today?.windGusts ?? snapshot.weather.windGusts
  );
  const seaRisk = assessSea(
    snapshot.marine.waveHeightMax ?? snapshot.marine.waveHeight,
    snapshot.marine.wavePeriodMax ?? snapshot.marine.wavePeriod,
    today?.windGusts ?? snapshot.weather.windGusts
  );
  const farmRisk = assessFarm(
    rainRisk,
    heatRisk,
    today?.precipitationProbability ?? null,
    today?.precipitation ?? null,
    today?.evapotranspiration ?? null,
    today?.uvIndex ?? null
  );
  const publicRisk = getHighestRisk(
    heatRisk.level,
    rainRisk.level,
    windRisk.level
  );
  const publicStatus =
    publicRisk === rainRisk.level && rainRisk.level !== 'low'
      ? rainRisk.status
      : publicRisk === heatRisk.level && heatRisk.level !== 'low'
        ? heatRisk.status
        : publicRisk === windRisk.level && windRisk.level !== 'low'
          ? windRisk.status
          : 'Generally manageable conditions';
  const seaHeight =
    snapshot.marine.waveHeightMax ?? snapshot.marine.waveHeight ?? null;
  const seaPeriod =
    snapshot.marine.wavePeriodMax ?? snapshot.marine.wavePeriod ?? null;
  const forecastGusts = today?.windGusts ?? snapshot.weather.windGusts;

  return [
    {
      audience: 'Commuters and Errands',
      icon: 'ri-community-line',
      status: publicStatus,
      tone: getRiskTone(publicRisk),
      details: [
        {
          label: 'What This Means',
          bullets: [
            heatRisk.detail,
            rainRisk.detail,
            windRisk.detail,
            'Commutes, school trips, market runs, and outdoor waiting times may be affected.',
          ],
        },
        {
          label: 'What To Do',
          bullets: [
            'Bring water, an umbrella, or a raincoat when conditions call for it.',
            'Keep documents, phones, and medicines in a dry bag or covered pouch.',
            'Give yourself extra travel time, especially for tricycle, bus, or boat connections.',
            'Follow official warnings, class suspension notices, and road advisories.',
          ],
        },
        {
          label: 'Weather Basis',
          bullets: [
            `Feels like ${formatDecimal(snapshot.weather.apparentTemperature)}°C with ${formatNumber(snapshot.weather.humidity)}% humidity.`,
            `Rain chance is ${formatNumber(today?.precipitationProbability)}%, with ${formatDecimal(today?.precipitation)} mm expected.`,
            `Wind gusts may reach ${formatNumber(forecastGusts)} km/h.`,
          ],
        },
      ],
    },
    {
      audience: 'Fisherfolk and Coastal Travel',
      icon: 'ri-ship-2-line',
      status: seaRisk.status,
      tone: getRiskTone(seaRisk.level),
      details: [
        {
          label: 'What This Means',
          bullets: [
            seaRisk.detail,
            'Shorter wave timing can make the ride feel choppier for small boats.',
            'Stronger gusts can make docking, landing, or returning to shore harder.',
          ],
        },
        {
          label: 'What To Do',
          bullets: [
            'Compare this forecast with what you actually see at the shore.',
            'Check Coast Guard, MDRRMO, barangay, or port advisories.',
            'Delay sailing, fishing, or coastal travel if wind or waves look unsafe.',
          ],
        },
        {
          label: 'Weather Basis',
          bullets: [
            `Waves may reach ${formatDecimal(seaHeight)} m.`,
            `Wave period is near ${formatDecimal(seaPeriod)} seconds.`,
            `Wind gusts may reach ${formatNumber(forecastGusts)} km/h.`,
          ],
        },
      ],
    },
    {
      audience: 'Farmers and Field Work',
      icon: 'ri-seedling-line',
      status: farmRisk.status,
      tone: getRiskTone(farmRisk.level),
      details: [
        {
          label: 'What This Means',
          bullets: [
            farmRisk.detail,
            'Rain can interrupt crop drying, spraying, hauling, transplanting, or fish drying.',
            'Heat and UV can dry soil faster and increase water needs for crops and workers.',
          ],
        },
        {
          label: 'What To Do',
          bullets: [
            'Use cover, tarps, or shaded areas when drying harvest or fish.',
            'Check soil moisture before watering so irrigation is targeted.',
            'Bring drinking water for field workers.',
            'Schedule longer field work for cooler parts of the day when possible.',
          ],
        },
        {
          label: 'Weather Basis',
          bullets: [
            `Rain chance is ${formatNumber(today?.precipitationProbability)}%, with ${formatDecimal(today?.precipitation)} mm expected.`,
            `Evapotranspiration is ${formatDecimal(today?.evapotranspiration)} mm.`,
            `UV level is ${getUvLevel(today?.uvIndex ?? null).toLowerCase()}.`,
          ],
        },
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

function ForecastCard({ day, index }: { day: DailyOutlook; index: number }) {
  const condition = getWeatherInfo(day.weatherCode);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatDayLabel(day.date, index)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{condition.label}</p>
        </div>
        <i
          className={`${condition.icon} inline-flex h-8 w-8 items-center justify-center text-3xl leading-none text-primary-700`}
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Temperature</p>
          <p className="font-semibold text-slate-900">
            {formatNumber(day.temperatureMin)}°-
            {formatNumber(day.temperatureMax)}
            °C
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Rain chance</p>
          <p className="font-semibold text-slate-900">
            {formatNumber(day.precipitationProbability)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Rain total</p>
          <p className="font-semibold text-slate-900">
            {formatDecimal(day.precipitation)} mm
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">UV level</p>
          <p className="font-semibold text-slate-900">
            {getUvLevel(day.uvIndex)}
          </p>
        </div>
      </div>
    </article>
  );
}

function AdvisoryCard({
  advisory,
  defaultOpen = false,
}: {
  advisory: Advisory;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={`group rounded-lg border shadow-sm ${advisory.tone}`}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-5 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <i
            className={`${advisory.icon} inline-flex h-5 w-5 items-center justify-center leading-none`}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-900">
            {advisory.audience}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-700">
            {advisory.status}
          </p>
        </div>
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-500 transition-transform group-open:rotate-180">
          <i
            className="ri-arrow-down-s-line inline-flex h-5 w-5 items-center justify-center text-xl leading-none"
            aria-hidden="true"
          />
        </span>
      </summary>

      <div className="space-y-3 border-t border-black/5 px-5 pb-5 pt-4 text-sm leading-6 text-slate-700">
        {advisory.details.map(detail => (
          <div key={detail.label}>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              {detail.label}
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {detail.bullets.map(bullet => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
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
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary-700">
              What's the weather?
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              Local Weather Conditions
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A practical guide for residents, fisherfolk, and farmers.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-primary-700 p-6 text-white shadow-sm sm:p-8">
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
                <span>
                  Wind: {formatNumber(weather?.windSpeed)} km/h{' '}
                  {getWindDirection(weather?.windDirection ?? null)}
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
                  helper="Takes humidity into account for a 'feels like' temperature."
                />
                <ClimateMetric
                  icon="ri-water-percent-line"
                  label="Humidity"
                  value={`${formatNumber(weather?.humidity)}%`}
                  helper="High humidity makes heat feel heavier."
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
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-4 lg:grid-cols-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Today's Advisories
          </h3>

          {advisories.map(advisory => (
            <AdvisoryCard key={advisory.audience} advisory={advisory} />
          ))}
        </div>

        <div className="mt-6 grid">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              3-Day Weather Outlook
            </h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {(snapshot?.outlook ?? []).map((day, index) => (
                <ForecastCard key={day.date} day={day} index={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-xs leading-5 text-slate-500">
          <p>
            Data is provided by{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-700 underline"
            >
              Open-Meteo
            </a>{' '}
            . This service is for public guidance only. For official warnings,
            class suspensions, evacuation notices, and maritime advisories,
            follow local and national government announcements.
          </p>
        </div>
      </div>
    </section>
  );
}
