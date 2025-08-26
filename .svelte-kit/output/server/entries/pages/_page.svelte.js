import { x as attr, F as attr_style, z as escape_html, v as pop, t as push } from "../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  let { data: initialData } = $$props;
  let currentData = initialData;
  let imgUrl = initialData.webcam?.imageUrl ?? "";
  let progressRatio = 0;
  function formatTemp(temp) {
    if (temp == null) return "";
    return `${Math.round(temp)}°C`;
  }
  function formatCoords(lat, lon) {
    const latDir = lat >= 0 ? "N" : "S";
    const lonDir = lon >= 0 ? "E" : "W";
    return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
  }
  function formatLastUpdated(timestamp) {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 6e4);
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleString();
  }
  if (currentData.webcam) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="webcam-container"><img${attr("src", imgUrl)}${attr("alt", currentData.webcam.title || "Rainy webcam")} class="webcam-image"/> <div class="progress-bottom"><div class="progress-fill"${attr_style(`width: ${Math.round(progressRatio * 100)}%`)}></div></div> <div class="weather-overlay"><div class="weather-content"><div class="location-name">`);
    if (currentData.webcam.locationName) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`${escape_html(currentData.webcam.locationName)}`);
      if (currentData.webcam.countryCode) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`, ${escape_html(currentData.webcam.countryCode)}`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (currentData.webcam.title) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`${escape_html(currentData.webcam.title)}`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`Unknown Location`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></div> <div class="coordinates">${escape_html(formatCoords(currentData.webcam.latitude, currentData.webcam.longitude))}</div> <div class="weather-conditions">`);
    if (currentData.weatherDescription) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="weather-item"><span class="label">Conditions:</span> ${escape_html(currentData.weatherDescription)}</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (currentData.rain.details.temperature != null) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="weather-item"><span class="label">Temperature:</span> ${escape_html(formatTemp(currentData.rain.details.temperature))} `);
      if (currentData.rain.details.apparent_temperature != null) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<span class="temperature-feels-like">(feels like ${escape_html(formatTemp(currentData.rain.details.apparent_temperature))})</span>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (currentData.rain.details.precipitation != null) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="weather-item"><span class="label">Precipitation:</span> ${escape_html(currentData.rain.details.precipitation.toFixed(1))} mm/h</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (currentData.rain.details.humidity != null) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="weather-item"><span class="label">Humidity:</span> ${escape_html(Math.round(currentData.rain.details.humidity))}%</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (currentData.rain.details.wind_speed != null) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="weather-item"><span class="label">Wind:</span> ${escape_html(Math.round(currentData.rain.details.wind_speed))} km/h</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div> <div class="status-footer"><div class="status-items">`);
    if (currentData.webcam?.lastUpdated) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="status-item"><span class="label">Updated:</span> ${escape_html(formatLastUpdated(currentData.webcam.lastUpdated))}</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="no-webcam-container"><div class="no-webcam-content"><div class="no-webcam-title">No rainy webcam found right now.</div> <div class="no-webcam-subtitle">Try again in a moment.</div> `);
    if (currentData.hasWindyKey === false) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="no-webcam-warning">Missing WINDY_WEBCAMS_API_KEY. See README for setup.</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default
};
