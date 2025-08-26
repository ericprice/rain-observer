export type RainCheck = {
  isRaining: boolean;
  details: {
    precipitation?: number;
    rain?: number;
    weather_code?: number;
    temperature?: number;
    apparent_temperature?: number;
    wind_speed?: number;
    humidity?: number;
  };
};

const RAINY_WEATHER_CODES = new Set<number>([
  // drizzle
  51, 53, 55,
  // freezing drizzle
  56, 57,
  // rain
  61, 63, 65,
  // freezing rain
  66, 67,
  // rain showers
  80, 81, 82,
  // thunderstorms (often with rain)
  95, 96, 99
]);

export function getWeatherDescription(code?: number): string {
  if (code == null) return "Unknown";
  
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog",
    51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
    56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    66: "Light freezing rain", 67: "Heavy freezing rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
    85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
  };
  
  return descriptions[code] || "Unknown";
}

export async function isRainingAt(latitude: number, longitude: number): Promise<RainCheck> {
  const key = `${round(latitude, 2)},${round(longitude, 2)}`;
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "precipitation,rain,weather_code,temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m");
  url.searchParams.set("timezone", "UTC");

  const res = await fetch(url.toString(), { headers: { "accept": "application/json" } });
  if (!res.ok) {
    const v = { isRaining: false, details: {} } as RainCheck;
    cache.set(key, { value: v, expiresAt: now + TTL_MS });
    return v;
  }
  const data = await res.json().catch(() => ({} as any));
  const current = (data as any)?.current ?? {};
  const precipitation = typeof current.precipitation === "number" ? current.precipitation : undefined;
  const rain = typeof current.rain === "number" ? current.rain : undefined;
  const weather_code = typeof current.weather_code === "number" ? current.weather_code : undefined;
  const temperature = typeof current.temperature_2m === "number" ? current.temperature_2m : undefined;
  const apparent_temperature = typeof current.apparent_temperature === "number" ? current.apparent_temperature : undefined;
  const wind_speed = typeof current.wind_speed_10m === "number" ? current.wind_speed_10m : undefined;
  const humidity = typeof current.relative_humidity_2m === "number" ? current.relative_humidity_2m : undefined;

  const rainingByAmount = (rain ?? precipitation ?? 0) > 0;
  const rainingByCode = weather_code != null && RAINY_WEATHER_CODES.has(weather_code);
  const value: RainCheck = {
    isRaining: Boolean(rainingByAmount || rainingByCode),
    details: { precipitation, rain, weather_code, temperature, apparent_temperature, wind_speed, humidity }
  };
  cache.set(key, { value, expiresAt: now + TTL_MS });
  return value;
}

type CacheEntry = { value: RainCheck; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}


