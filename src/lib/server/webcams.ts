import { env } from '$env/dynamic/private';

export type Webcam = {
  id: string;
  title?: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  countryCode?: string;
  lastUpdated?: string;
};

// Windy Webcams API v3 base discovered via probes requiring 'x-windy-api-key' header
// Base: https://api.windy.com/webcams/api/v3
// List: GET /webcams?limit=...&nearby=lat,lon,radius
// Popular: GET /webcams?limit=... (optionally orderby parameter)
const WINDY_V3_BASE = 'https://api.windy.com/webcams/api/v3';

export async function fetchNearbyWebcams(latitude: number, longitude: number, radiusKm = 50): Promise<Webcam[]> {
  const apiKey = env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];

  const url = new URL(`${WINDY_V3_BASE}/webcams`);
  url.searchParams.set('nearby', `${latitude},${longitude},${radiusKm}`);
  url.searchParams.set('limit', '50');
  url.searchParams.set('include', 'location,images');

  const res = await fetch(url.toString(), {
    headers: { 'accept': 'application/json', 'x-windy-api-key': apiKey }
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({} as any));

  const webcams = ((data as any)?.result?.webcams ?? (data as any)?.webcams ?? []) as any[];
  
  
  return webcams
    .map((cam) => {
      const images = cam?.images ?? cam?.image;
      const img = images?.current || images?.daylight || images;
      const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
      const loc = cam?.location ?? {};
      // Get last update time from API
      const lastUpdated = cam?.lastUpdatedOn || cam?.lastUpdatedAt || cam?.last_updated;
      return {
        id: String(cam?.webcamId ?? cam?.id ?? ''),
        title: cam?.title,
        imageUrl,
        latitude: Number(loc?.latitude ?? latitude),
        longitude: Number(loc?.longitude ?? longitude),
        locationName: loc?.city || loc?.region,
        countryCode: loc?.country_code,
        lastUpdated: lastUpdated ? String(lastUpdated) : undefined
      } as Webcam;
    })
    .filter((w) => Boolean(w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)));
}

export async function fetchPopularWebcams(limit = 200): Promise<Webcam[]> {
  const apiKey = env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];

  const url = new URL(`${WINDY_V3_BASE}/webcams`);
  url.searchParams.set('limit', String(Math.min(50, limit)));
  url.searchParams.set('include', 'location,images');
  // Some deployments support orderby=popularity:desc; ignore if unsupported
  url.searchParams.set('orderby', 'popularity:desc');

  const res = await fetch(url.toString(), {
    headers: { 'accept': 'application/json', 'x-windy-api-key': apiKey }
  });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({} as any));
  const webcams = ((data as any)?.result?.webcams ?? (data as any)?.webcams ?? []) as any[];
  return webcams
    .map((cam) => {
      const images = cam?.images ?? cam?.image;
      const img = images?.current || images?.daylight || images;
      const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
      const loc = cam?.location ?? {};
      const lastUpdated = cam?.lastUpdatedOn || cam?.lastUpdatedAt || cam?.last_updated;
      return {
        id: String(cam?.webcamId ?? cam?.id ?? ''),
        title: cam?.title,
        imageUrl,
        latitude: Number(loc?.latitude),
        longitude: Number(loc?.longitude),
        locationName: loc?.city || loc?.region,
        countryCode: loc?.country_code,
        lastUpdated: lastUpdated ? String(lastUpdated) : undefined
      } as Webcam;
    })
    .filter((w) => Boolean(w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)));
}

export async function fetchRandomGlobalWebcams(args?: {
  pages?: number; // how many pages to sample
  limitPerPage?: number; // webcams per page
}): Promise<Webcam[]> {
  const apiKey = env.WINDY_WEBCAMS_API_KEY;
  if (!apiKey) return [];

  const pages = Math.max(1, Math.min(20, args?.pages ?? 6));
  const limitPerPage = Math.max(10, Math.min(50, args?.limitPerPage ?? 50));

  // First, get total count
  const base = new URL(`${WINDY_V3_BASE}/webcams`);
  base.searchParams.set('limit', '1');
  const totalRes = await fetch(base.toString(), {
    headers: { 'accept': 'application/json', 'x-windy-api-key': apiKey }
  });
  if (!totalRes.ok) return [];
  const totalJson = await totalRes.json().catch(() => ({} as any));
  const total = Number((totalJson as any)?.result?.total ?? (totalJson as any)?.total ?? 0);
  if (!Number.isFinite(total) || total <= 0) return [];

  const offsets: number[] = [];
  const maxOffset = Math.max(0, total - limitPerPage - 1);
  for (let i = 0; i < pages; i++) {
    offsets.push(Math.floor(Math.random() * (maxOffset + 1)));
  }

  const byId = new Map<string, Webcam>();
  const requests = offsets.map(async (offset) => {
    const url = new URL(`${WINDY_V3_BASE}/webcams`);
    url.searchParams.set('limit', String(limitPerPage));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('include', 'location,images');
    const res = await fetch(url.toString(), {
      headers: { 'accept': 'application/json', 'x-windy-api-key': apiKey }
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({} as any));
    const webcams = ((data as any)?.result?.webcams ?? (data as any)?.webcams ?? []) as any[];
    for (const cam of webcams) {
      const images = cam?.images ?? cam?.image;
      const img = images?.current || images?.daylight || images;
      const imageUrl = img?.preview || img?.icon || img?.thumbnail || img?.toString?.();
      const loc = cam?.location ?? {};
      const lastUpdated = cam?.lastUpdatedOn || cam?.lastUpdatedAt || cam?.last_updated;
      const w: Webcam = {
        id: String(cam?.webcamId ?? cam?.id ?? ''),
        title: cam?.title,
        imageUrl,
        latitude: Number(loc?.latitude),
        longitude: Number(loc?.longitude),
        locationName: loc?.city || loc?.region,
        countryCode: loc?.country_code,
        lastUpdated: lastUpdated ? String(lastUpdated) : undefined
      };
      if (w.id && w.imageUrl && Number.isFinite(w.latitude) && Number.isFinite(w.longitude)) {
        byId.set(w.id, w);
      }
    }
  });

  await Promise.all(requests);
  const all = Array.from(byId.values());
  // Shuffle for variety
  all.sort(() => Math.random() - 0.5);
  return all;
}


// Broad, diverse set of world seed coordinates to sample webcams globally
const GLOBAL_SEEDS: Array<{ lat: number; lon: number }> = [
  // North America
  { lat: 40.7128, lon: -74.0060 }, // New York
  { lat: 34.0522, lon: -118.2437 }, // Los Angeles
  { lat: 41.8781, lon: -87.6298 }, // Chicago
  { lat: 49.2827, lon: -123.1207 }, // Vancouver
  { lat: 25.7617, lon: -80.1918 }, // Miami
  { lat: 29.7604, lon: -95.3698 }, // Houston
  { lat: 19.4326, lon: -99.1332 }, // Mexico City
  { lat: 45.5019, lon: -73.5674 }, // Montreal
  { lat: 61.2181, lon: -149.9003 }, // Anchorage

  // South America
  { lat: -23.5505, lon: -46.6333 }, // São Paulo
  { lat: -34.6037, lon: -58.3816 }, // Buenos Aires
  { lat: -12.0464, lon: -77.0428 }, // Lima
  { lat: -33.4489, lon: -70.6693 }, // Santiago
  { lat: 4.7110, lon: -74.0721 }, // Bogotá

  // Europe
  { lat: 51.5074, lon: -0.1278 }, // London
  { lat: 48.8566, lon: 2.3522 }, // Paris
  { lat: 52.5200, lon: 13.4050 }, // Berlin
  { lat: 41.9028, lon: 12.4964 }, // Rome
  { lat: 40.4168, lon: -3.7038 }, // Madrid
  { lat: 59.3293, lon: 18.0686 }, // Stockholm
  { lat: 60.1699, lon: 24.9384 }, // Helsinki
  { lat: 55.6761, lon: 12.5683 }, // Copenhagen
  { lat: 52.3676, lon: 4.9041 }, // Amsterdam
  { lat: 64.1466, lon: -21.9426 }, // Reykjavik

  // Africa
  { lat: 30.0444, lon: 31.2357 }, // Cairo
  { lat: 6.5244, lon: 3.3792 }, // Lagos
  { lat: -1.2921, lon: 36.8219 }, // Nairobi
  { lat: -26.2041, lon: 28.0473 }, // Johannesburg
  { lat: -33.9249, lon: 18.4241 }, // Cape Town
  { lat: 33.5731, lon: -7.5898 }, // Casablanca

  // Middle East
  { lat: 25.2048, lon: 55.2708 }, // Dubai
  { lat: 24.7136, lon: 46.6753 }, // Riyadh
  { lat: 31.7683, lon: 35.2137 }, // Jerusalem
  { lat: 41.0082, lon: 28.9784 }, // Istanbul

  // Asia
  { lat: 35.6895, lon: 139.6917 }, // Tokyo
  { lat: 37.5665, lon: 126.9780 }, // Seoul
  { lat: 31.2304, lon: 121.4737 }, // Shanghai
  { lat: 22.3193, lon: 114.1694 }, // Hong Kong
  { lat: 1.3521, lon: 103.8198 }, // Singapore
  { lat: 13.7563, lon: 100.5018 }, // Bangkok
  { lat: 28.6139, lon: 77.2090 }, // Delhi
  { lat: 19.0760, lon: 72.8777 }, // Mumbai
  { lat: -6.2088, lon: 106.8456 }, // Jakarta

  // Oceania
  { lat: -33.8688, lon: 151.2093 }, // Sydney
  { lat: -37.8136, lon: 144.9631 }, // Melbourne
  { lat: -36.8485, lon: 174.7633 }, // Auckland
  { lat: -31.9523, lon: 115.8613 }, // Perth
];

export async function fetchGlobalWebcamPool(args?: {
  radiusKm?: number;
  maxWebcams?: number;
  seeds?: Array<{ lat: number; lon: number }>;
}): Promise<Webcam[]> {
  const radiusKm = args?.radiusKm ?? 120;
  const maxWebcams = args?.maxWebcams ?? 200;
  const seeds = (args?.seeds ?? GLOBAL_SEEDS).slice();
  const byId = new Map<string, Webcam>();

  // randomize seed order for variety per request
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


