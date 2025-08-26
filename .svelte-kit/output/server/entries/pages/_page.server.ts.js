import { f as fetchGlobalWebcamPool, a as fetchPopularWebcams, b as fetchRandomGlobalWebcams, i as isRainingAt, g as getWeatherDescription, c as fetchNearbyWebcams } from "../../chunks/webcams.js";
import { b as private_env } from "../../chunks/shared-server.js";
const load = async () => {
  const hasWindyKey = Boolean(private_env.WINDY_WEBCAMS_API_KEY);
  const [poolA, poolB, poolC] = await Promise.all([
    fetchGlobalWebcamPool({ radiusKm: 150, maxWebcams: 250 }),
    fetchPopularWebcams(50),
    fetchRandomGlobalWebcams({ pages: 10, limitPerPage: 50 })
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
      return {
        webcam: match.cam,
        rain: match.rain,
        weatherDescription: getWeatherDescription(match.rain.details.weather_code),
        hasWindyKey
      };
    }
  }
  for (let attempt = 0; attempt < 60; attempt++) {
    const lat = Math.random() * 120 - 60;
    const lon = Math.random() * 360 - 180;
    try {
      const rain = await isRainingAt(lat, lon);
      if (!rain.isRaining) continue;
      const cams = await fetchNearbyWebcams(lat, lon, 120);
      if (cams.length) {
        const cam = cams[Math.floor(Math.random() * cams.length)];
        return {
          webcam: cam,
          rain,
          weatherDescription: getWeatherDescription(rain.details.weather_code),
          hasWindyKey
        };
      }
    } catch {
    }
  }
  return {
    webcam: null,
    rain: { isRaining: false, details: {} },
    weatherDescription: "Unknown",
    hasWindyKey
  };
};
export {
  load
};
