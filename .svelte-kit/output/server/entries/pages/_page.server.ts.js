import { b as private_env } from "../../chunks/shared-server.js";
const RAINY_WEATHER_CODES = /* @__PURE__ */ new Set([
  // drizzle
  51,
  53,
  55,
  // freezing drizzle
  56,
  57,
  // rain
  61,
  63,
  65,
  // freezing rain
  66,
  67,
  // rain showers
  80,
  81,
  82,
  // thunderstorms (often with rain)
  95,
  96,
  99
]);
async function isRainingAt(latitude, longitude) {
  const key = `${round(latitude, 2)},${round(longitude, 2)}`;
  const cached = cache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "precipitation,rain,weather_code");
  url.searchParams.set("timezone", "UTC");
  const res = await fetch(url.toString(), { headers: { "accept": "application/json" } });
  if (!res.ok) {
    const v = { isRaining: false, details: {} };
    cache.set(key, { value: v, expiresAt: now + TTL_MS });
    return v;
  }
  const data = await res.json().catch(() => ({}));
  const current = data?.current ?? {};
  const precipitation = typeof current.precipitation === "number" ? current.precipitation : void 0;
  const rain = typeof current.rain === "number" ? current.rain : void 0;
  const weather_code = typeof current.weather_code === "number" ? current.weather_code : void 0;
  const rainingByAmount = (rain ?? precipitation ?? 0) > 0;
  const rainingByCode = weather_code != null && RAINY_WEATHER_CODES.has(weather_code);
  const value = {
    isRaining: Boolean(rainingByAmount || rainingByCode),
    details: { precipitation, rain, weather_code }
  };
  cache.set(key, { value, expiresAt: now + TTL_MS });
  return value;
}
const cache = /* @__PURE__ */ new Map();
const TTL_MS = 10 * 60 * 1e3;
function round(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}
const WINDY_V3_BASE = "https://api.windy.com/webcams/api/v3";
async function fetchNearbyWebcams(latitude, longitude, radiusKm = 50) {
  const apiKey = private_env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];
  const url = new URL(`${WINDY_V3_BASE}/webcams`);
  url.searchParams.set("nearby", `${latitude},${longitude},${radiusKm}`);
  url.searchParams.set("limit", "100");
  url.searchParams.set("include", "location,images");
  const res = await fetch(url.toString(), {
    headers: { "accept": "application/json", "x-windy-api-key": apiKey }
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  const webcams = data?.result?.webcams ?? data?.webcams ?? [];
  return webcams.map((cam) => {
    const images = cam?.images ?? cam?.image;
    const img = images?.current || images?.daylight || images;
    const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
    const loc = cam?.location ?? {};
    return {
      id: String(cam?.webcamId ?? cam?.id ?? ""),
      title: cam?.title,
      imageUrl,
      latitude: Number(loc?.latitude ?? latitude),
      longitude: Number(loc?.longitude ?? longitude),
      locationName: loc?.city || loc?.region,
      countryCode: loc?.country_code
    };
  }).filter((w) => Boolean(w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)));
}
async function fetchPopularWebcams(limit = 200) {
  const apiKey = private_env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];
  const url = new URL(`${WINDY_V3_BASE}/webcams`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("include", "location,images");
  url.searchParams.set("orderby", "popularity:desc");
  const res = await fetch(url.toString(), {
    headers: { "accept": "application/json", "x-windy-api-key": apiKey }
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  const webcams = data?.result?.webcams ?? data?.webcams ?? [];
  return webcams.map((cam) => {
    const images = cam?.images ?? cam?.image;
    const img = images?.current || images?.daylight || images;
    const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
    const loc = cam?.location ?? {};
    return {
      id: String(cam?.webcamId ?? cam?.id ?? ""),
      title: cam?.title,
      imageUrl,
      latitude: Number(loc?.latitude),
      longitude: Number(loc?.longitude),
      locationName: loc?.city || loc?.region,
      countryCode: loc?.country_code
    };
  }).filter((w) => Boolean(w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)));
}
async function fetchRandomGlobalWebcams(args) {
  const apiKey = private_env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];
  const pages = Math.max(1, Math.min(20, args?.pages));
  const limitPerPage = Math.max(10, Math.min(100, args?.limitPerPage));
  const base = new URL(`${WINDY_V3_BASE}/webcams`);
  base.searchParams.set("limit", "1");
  const totalRes = await fetch(base.toString(), {
    headers: { "accept": "application/json", "x-windy-api-key": apiKey }
  });
  if (!totalRes.ok) return [];
  const totalJson = await totalRes.json().catch(() => ({}));
  const total = Number(totalJson?.total ?? 0);
  if (!Number.isFinite(total) || total <= 0) return [];
  const offsets = [];
  const maxOffset = Math.max(0, total - limitPerPage - 1);
  for (let i = 0; i < pages; i++) {
    offsets.push(Math.floor(Math.random() * (maxOffset + 1)));
  }
  const byId = /* @__PURE__ */ new Map();
  const requests = offsets.map(async (offset) => {
    const url = new URL(`${WINDY_V3_BASE}/webcams`);
    url.searchParams.set("limit", String(limitPerPage));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("include", "location,images");
    const res = await fetch(url.toString(), {
      headers: { "accept": "application/json", "x-windy-api-key": apiKey }
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    const webcams = data?.webcams ?? [];
    for (const cam of webcams) {
      const images = cam?.images ?? cam?.image;
      const img = images?.current || images?.daylight || images;
      const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
      const loc = cam?.location ?? {};
      const w = {
        id: String(cam?.webcamId ?? cam?.id ?? ""),
        title: cam?.title,
        imageUrl,
        latitude: Number(loc?.latitude),
        longitude: Number(loc?.longitude),
        locationName: loc?.city || loc?.region,
        countryCode: loc?.country_code
      };
      if (w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)) {
        byId.set(w.id, w);
      }
    }
  });
  await Promise.all(requests);
  const all = Array.from(byId.values());
  all.sort(() => Math.random() - 0.5);
  return all;
}
const GLOBAL_SEEDS = [
  // North America
  { lat: 40.7128, lon: -74.006 },
  // New York
  { lat: 34.0522, lon: -118.2437 },
  // Los Angeles
  { lat: 41.8781, lon: -87.6298 },
  // Chicago
  { lat: 49.2827, lon: -123.1207 },
  // Vancouver
  { lat: 25.7617, lon: -80.1918 },
  // Miami
  { lat: 29.7604, lon: -95.3698 },
  // Houston
  { lat: 19.4326, lon: -99.1332 },
  // Mexico City
  { lat: 45.5019, lon: -73.5674 },
  // Montreal
  { lat: 61.2181, lon: -149.9003 },
  // Anchorage
  // South America
  { lat: -23.5505, lon: -46.6333 },
  // São Paulo
  { lat: -34.6037, lon: -58.3816 },
  // Buenos Aires
  { lat: -12.0464, lon: -77.0428 },
  // Lima
  { lat: -33.4489, lon: -70.6693 },
  // Santiago
  { lat: 4.711, lon: -74.0721 },
  // Bogotá
  // Europe
  { lat: 51.5074, lon: -0.1278 },
  // London
  { lat: 48.8566, lon: 2.3522 },
  // Paris
  { lat: 52.52, lon: 13.405 },
  // Berlin
  { lat: 41.9028, lon: 12.4964 },
  // Rome
  { lat: 40.4168, lon: -3.7038 },
  // Madrid
  { lat: 59.3293, lon: 18.0686 },
  // Stockholm
  { lat: 60.1699, lon: 24.9384 },
  // Helsinki
  { lat: 55.6761, lon: 12.5683 },
  // Copenhagen
  { lat: 52.3676, lon: 4.9041 },
  // Amsterdam
  { lat: 64.1466, lon: -21.9426 },
  // Reykjavik
  // Africa
  { lat: 30.0444, lon: 31.2357 },
  // Cairo
  { lat: 6.5244, lon: 3.3792 },
  // Lagos
  { lat: -1.2921, lon: 36.8219 },
  // Nairobi
  { lat: -26.2041, lon: 28.0473 },
  // Johannesburg
  { lat: -33.9249, lon: 18.4241 },
  // Cape Town
  { lat: 33.5731, lon: -7.5898 },
  // Casablanca
  // Middle East
  { lat: 25.2048, lon: 55.2708 },
  // Dubai
  { lat: 24.7136, lon: 46.6753 },
  // Riyadh
  { lat: 31.7683, lon: 35.2137 },
  // Jerusalem
  { lat: 41.0082, lon: 28.9784 },
  // Istanbul
  // Asia
  { lat: 35.6895, lon: 139.6917 },
  // Tokyo
  { lat: 37.5665, lon: 126.978 },
  // Seoul
  { lat: 31.2304, lon: 121.4737 },
  // Shanghai
  { lat: 22.3193, lon: 114.1694 },
  // Hong Kong
  { lat: 1.3521, lon: 103.8198 },
  // Singapore
  { lat: 13.7563, lon: 100.5018 },
  // Bangkok
  { lat: 28.6139, lon: 77.209 },
  // Delhi
  { lat: 19.076, lon: 72.8777 },
  // Mumbai
  { lat: -6.2088, lon: 106.8456 },
  // Jakarta
  // Oceania
  { lat: -33.8688, lon: 151.2093 },
  // Sydney
  { lat: -37.8136, lon: 144.9631 },
  // Melbourne
  { lat: -36.8485, lon: 174.7633 },
  // Auckland
  { lat: -31.9523, lon: 115.8613 }
  // Perth
];
async function fetchGlobalWebcamPool(args) {
  const radiusKm = args?.radiusKm;
  const maxWebcams = args?.maxWebcams;
  const seeds = (args?.seeds ?? GLOBAL_SEEDS).slice();
  const byId = /* @__PURE__ */ new Map();
  seeds.sort(() => Math.random() - 0.5);
  for (const s of seeds) {
    const cams = await fetchNearbyWebcams(s.lat, s.lon, radiusKm);
    for (const c of cams) {
      if (!byId.has(c.id)) {
        byId.set(c.id, c);
        if (byId.size >= maxWebcams) {
          return Array.from(byId.values());
        }
      }
    }
  }
  return Array.from(byId.values());
}
const load = async () => {
  const hasWindyKey = Boolean(private_env.WINDY_WEBCAMS_API_KEY);
  const [poolA, poolB, poolC] = await Promise.all([
    fetchGlobalWebcamPool({ radiusKm: 150, maxWebcams: 250 }),
    fetchPopularWebcams(200),
    fetchRandomGlobalWebcams({ pages: 5, limitPerPage: 80 })
  ]);
  const pool = [...poolA, ...poolB, ...poolC];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const batchSize = 25;
  for (let i = 0; i < shuffled.length; i += batchSize) {
    const batch = shuffled.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (cam) => ({ cam, rain: await isRainingAt(cam.latitude, cam.longitude) }))
    );
    const match = results.find((r) => r.rain.isRaining);
    if (match) {
      return { webcam: match.cam, rain: match.rain, hasWindyKey };
    }
  }
  for (let attempt = 0; attempt < 24; attempt++) {
    const lat = Math.random() * 120 - 60;
    const lon = Math.random() * 360 - 180;
    try {
      const rain = await isRainingAt(lat, lon);
      if (!rain.isRaining) continue;
      const cams = await fetchNearbyWebcams(lat, lon, 120);
      if (cams.length) {
        const cam = cams[Math.floor(Math.random() * cams.length)];
        return { webcam: cam, rain, hasWindyKey };
      }
    } catch {
    }
  }
  return { webcam: null, rain: { isRaining: false, details: {} }, hasWindyKey };
};
export {
  load
};
