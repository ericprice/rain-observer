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
    setActive(); // show UI immediately when loading starts
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
        setActive(); // show UI and restart idle timer on camera change
      }
    } catch (error) {
      console.error('Failed to fetch new camera:', error);
    } finally {
      isLoadingNewCamera = false;
    }
  }
  
  // Idle detection
  const IDLE_TIMEOUT_MS = 3500;
  let isIdle = $state(false);
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  function setActive() {
    if (isIdle) {
      isIdle = false; // remove idle immediately
    }
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      isIdle = true; // enter idle after 5s
    }, IDLE_TIMEOUT_MS);
  }

  function attachIdleListeners(node: HTMLElement) {
    const events = ['mousemove', 'pointerdown', 'keydown', 'touchstart'];
    events.forEach((e) => node.addEventListener(e, setActive, { passive: true } as AddEventListenerOptions));
    // start timer on mount
    setActive();
    return () => {
      events.forEach((e) => node.removeEventListener(e, setActive));
      if (idleTimer) clearTimeout(idleTimer);
    };
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
    
    // Start raindrops
    scheduleNextDrop();

    return () => {
      clearInterval(imageInterval);
      clearInterval(cameraInterval);
      clearInterval(progressInterval);
      if (raindropTimer) clearTimeout(raindropTimer);
      if (raindropsContainer) raindropsContainer.innerHTML = '';
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

  let raindropsContainer: HTMLDivElement | null = null;
  let raindropTimer: ReturnType<typeof setTimeout> | null = null;

  function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  function scheduleNextDrop() {
    const delayMs = randomBetween(100, 1500);
    raindropTimer = setTimeout(() => {
      spawnRaindrop();
      scheduleNextDrop();
    }, delayMs);
  }

  function spawnRaindrop() {
    const container = raindropsContainer;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const containerFontSize = parseFloat(getComputedStyle(container).fontSize) || 16;

    const sizeEm = randomBetween(0.5, 1.5);
    const sizePx = sizeEm * containerFontSize;

    const x = randomBetween(0, Math.max(0, rect.width - sizePx));
    const y = randomBetween(0, Math.max(0, rect.height * 0.6)); // land somewhere in upper 60%

    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.width = `${sizeEm}em`;
    drop.style.height = `${sizeEm}em`;
    drop.style.left = `${x}px`;
    drop.style.top = `${y}px`;

    // fall past bottom edge
    const fallPx = Math.max(50, rect.height - y + sizePx + 20);
    drop.style.setProperty('--fall', `${fallPx}px`);

    // slight random fall duration
    const fallMs = Math.round(randomBetween(2200, 4200));
    drop.style.setProperty('--fallMs', `${fallMs}ms`);

    const onAnimEnd = (ev: AnimationEvent) => {
      if (ev.animationName !== 'raindrop-fall') return; // ignore splash (::after)
      drop.removeEventListener('animationend', onAnimEnd);
      if (drop.parentNode) drop.parentNode.removeChild(drop);
    };

    drop.addEventListener('animationend', onAnimEnd);

    container.appendChild(drop);
  }
</script>

{#if currentData.webcam}
<!-- use a wrapper to attach idle listeners and toggle idle class -->
<div use:attachIdleListeners class={`webcam-container ${isIdle && !isLoadingNewCamera ? 'idle' : ''}`}>
  <img src={imgUrl} alt={currentData.webcam.title || 'Rainy webcam'} class="webcam-image" />

  <!-- Raindrops overlay -->
  <div class="raindrops-overlay" bind:this={raindropsContainer}></div>

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