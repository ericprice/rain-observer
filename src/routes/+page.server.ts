import type { PageServerLoad } from './$types';
import { isRainingAt, getWeatherDescription, fetchTimezoneInfo } from '$lib/server/openmeteo';
import { fetchGlobalWebcamPool, fetchPopularWebcams, fetchRandomGlobalWebcams, fetchNearbyWebcams } from '$lib/server/webcams';
import { env } from '$env/dynamic/private';

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr.length) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export const load: PageServerLoad = async () => {
  const hasWindyKey = Boolean(env.WINDY_WEBCAMS_API_KEY);
  // Build a global pool of webcams across many regions; fall back to popular listing
  const [poolA, poolB, poolC] = await Promise.all([
    fetchGlobalWebcamPool({ radiusKm: 150, maxWebcams: 250 }),
    fetchPopularWebcams(50),
    fetchRandomGlobalWebcams({ pages: 10, limitPerPage: 50 })
  ]);
  const pool = [...poolA, ...poolB, ...poolC];
  // randomize order for variety
  const shuffled = pool.sort(() => Math.random() - 0.5);

  // Check rain in small concurrent batches to find the first rainy webcam faster
  const batchSize = 25;
  for (let i = 0; i < shuffled.length; i += batchSize) {
    const batch = shuffled.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (cam) => ({ cam, rain: await isRainingAt(cam.latitude, cam.longitude) }))
    );
    const match = results.find((r) => r.rain.isRaining);
    if (match) {
      const tz = await fetchTimezoneInfo(match.cam.latitude, match.cam.longitude);
      return { 
        webcam: match.cam, 
        rain: match.rain, 
        weatherDescription: getWeatherDescription(match.rain.details.weather_code),
        timezoneId: tz.timezoneId,
        timezoneOffsetSeconds: tz.offsetSeconds,
        hasWindyKey 
      };
    }
  }

  // Fallback: probe random rainy coordinates, then fetch nearby webcams there
  for (let attempt = 0; attempt < 60; attempt++) {
    const lat = (Math.random() * 120) - 60; // -60..60 to bias towards populated latitudes
    const lon = (Math.random() * 360) - 180; // -180..180
    try {
      const rain = await isRainingAt(lat, lon);
      if (!rain.isRaining) continue;
      const cams = await fetchNearbyWebcams(lat, lon, 120);
      if (cams.length) {
        const cam = cams[Math.floor(Math.random() * cams.length)];
        const tz = await fetchTimezoneInfo(cam.latitude, cam.longitude);
        return { 
          webcam: cam, 
          rain, 
          weatherDescription: getWeatherDescription(rain.details.weather_code),
          timezoneId: tz.timezoneId,
          timezoneOffsetSeconds: tz.offsetSeconds,
          hasWindyKey 
        };
      }
    } catch {
      // ignore and continue
    }
  }

  return { 
    webcam: null, 
    rain: { isRaining: false, details: {} }, 
    weatherDescription: "Unknown",
    timezoneId: null,
    timezoneOffsetSeconds: null,
    hasWindyKey 
  };
};


