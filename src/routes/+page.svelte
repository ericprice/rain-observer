<script lang="ts">
  import { onMount } from 'svelte';
  import '../lib/assets/styles/main.scss';
  
  let { data: initialData } = $props<{
    data: {
      webcam: {
        id: string;
        title?: string;
        imageUrl: string;
        latitude: number;
        longitude: number;
        locationName?: string;
        countryCode?: string;
        lastUpdated?: string;
      } | null;
      rain: { 
        isRaining: boolean; 
        details: {
          precipitation?: number;
          rain?: number;
          weather_code?: number;
          temperature?: number;
          apparent_temperature?: number;
          wind_speed?: number;
          humidity?: number;
        }
      };
      weatherDescription?: string;
      hasWindyKey?: boolean;
    }
  }>();

  let currentData = $state(initialData);
  let imgUrl = $state(initialData.webcam?.imageUrl ?? '');
  let imageRefreshCount = $state(0);
  let cameraChangeCount = $state(0);
  let isLoadingNewCamera = $state(false);

  // Progress bar state (0 to 1)
  const CAMERA_INTERVAL_MS = 30000;
  let progressRatio = $state(0); // 0 = just reset, 1 = will switch now
  let lastResetAt = $state(Date.now());

  function resetProgress() {
    lastResetAt = Date.now();
    progressRatio = 0;
  }
  
  async function fetchNewCamera() {
    isLoadingNewCamera = true;
    try {
      const response = await fetch('/api/webcam');
      if (response.ok) {
        const newData = await response.json();
        currentData = newData;
        imgUrl = newData.webcam?.imageUrl ?? '';
        imageRefreshCount = 0; // Reset image refresh count for new camera
        cameraChangeCount++;
        resetProgress();
      }
    } catch (error) {
      console.error('Failed to fetch new camera:', error);
    } finally {
      isLoadingNewCamera = false;
    }
  }
  
  onMount(() => {
    // Refresh image every 3 seconds
    const imageInterval = setInterval(() => {
      if (currentData.webcam?.imageUrl) {
        // Add timestamp to force browser to reload image
        const baseUrl = currentData.webcam.imageUrl.split('?')[0];
        const params = new URLSearchParams(currentData.webcam.imageUrl.split('?')[1] || '');
        params.set('refresh', Date.now().toString());
        imgUrl = `${baseUrl}?${params.toString()}`;
        imageRefreshCount++;
      }
    }, 3000); // Refresh image every 3 seconds
    
    // Switch to new camera every 60 seconds
    const cameraInterval = setInterval(() => {
      fetchNewCamera();
    }, CAMERA_INTERVAL_MS); // Switch camera every 60 seconds

    // Progress timer at ~60 FPS
    resetProgress();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - lastResetAt;
      progressRatio = Math.min(1, elapsed / CAMERA_INTERVAL_MS);
    }, 1000 / 60);
    
    return () => {
      clearInterval(imageInterval);
      clearInterval(cameraInterval);
      clearInterval(progressInterval);
    };
  });
  
  function formatTemp(temp?: number): string {
    if (temp == null) return '';
    return `${Math.round(temp)}°C`;
  }
  
  function formatCoords(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
  }
  
  function formatLastUpdated(timestamp?: string): string {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return date.toLocaleString();
  }
</script>

{#if currentData.webcam}
<div class="webcam-container">
  <img src={imgUrl} alt={currentData.webcam.title || 'Rainy webcam'} class="webcam-image" />

  <!-- Bottom countdown progress bar -->
  <div class="progress-bottom">
    <div class="progress-fill" style={`width: ${Math.round(progressRatio * 100)}%`}></div>
  </div>
  
  <!-- Weather info overlay -->
  <div class="weather-overlay">
    <div class="weather-content">
      <!-- Location -->
      <div class="location-name">
        {#if currentData.webcam.locationName}
          {currentData.webcam.locationName}{#if currentData.webcam.countryCode}, {currentData.webcam.countryCode}{/if}
        {:else if currentData.webcam.title}
          {currentData.webcam.title}
        {:else}
          Unknown Location
        {/if}
      </div>
      
      <!-- Coordinates -->
      <div class="coordinates">
        {formatCoords(currentData.webcam.latitude, currentData.webcam.longitude)}
      </div>
      
      <!-- Weather conditions -->
      <div class="weather-conditions">
        {#if currentData.weatherDescription}
          <div class="weather-item">
            <span class="label">Conditions:</span> {currentData.weatherDescription}
          </div>
        {/if}
        
        {#if currentData.rain.details.temperature != null}
          <div class="weather-item">
            <span class="label">Temperature:</span> {formatTemp(currentData.rain.details.temperature)}
            {#if currentData.rain.details.apparent_temperature != null}
              <span class="temperature-feels-like"> (feels like {formatTemp(currentData.rain.details.apparent_temperature)})</span>
            {/if}
          </div>
        {/if}
        
        {#if currentData.rain.details.precipitation != null}
          <div class="weather-item">
            <span class="label">Precipitation:</span> {currentData.rain.details.precipitation.toFixed(1)} mm/h
          </div>
        {/if}
        
        {#if currentData.rain.details.humidity != null}
          <div class="weather-item">
            <span class="label">Humidity:</span> {Math.round(currentData.rain.details.humidity)}%
          </div>
        {/if}
        
        {#if currentData.rain.details.wind_speed != null}
          <div class="weather-item">
            <span class="label">Wind:</span> {Math.round(currentData.rain.details.wind_speed)} km/h
          </div>
        {/if}
      </div>
      
      <div class="status-footer">
        <div class="status-items">
          {#if currentData.webcam?.lastUpdated}
            <div class="status-item">
              <span class="label">Updated:</span> {formatLastUpdated(currentData.webcam.lastUpdated)}
            </div>
          {/if}
          {#if isLoadingNewCamera}
            <div class="status-item">Loading&hellip;</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
{:else}
<div class="no-webcam-container">
  <div class="no-webcam-content">
    <div class="no-webcam-title">No rainy webcam found right now.</div>
    <div class="no-webcam-subtitle">Try again in a moment.</div>
    {#if currentData.hasWindyKey === false}
      <div class="no-webcam-warning">Missing WINDY_WEBCAMS_API_KEY. See README for setup.</div>
    {/if}
  </div>
</div>
{/if}