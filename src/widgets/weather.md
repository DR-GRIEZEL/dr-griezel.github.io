---
layout: base
title: 'Weather Widget'
summary: 'Realtime weather with extra details like feels-like, wind, and precipitation chance.'
image: '/assets/img/widgets/weather.svg'
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/widgets/widgets.js
module_js: true
---

<section class="card" aria-label="Weather" data-widget="weather">
  <div class="wxbox" role="group" aria-describedby="wx-meta">
    <div class="wxline">
      <strong class="wx-temp" data-wx-temp>--°</strong>
      <span class="wx-desc" data-wx-desc>—</span>
    </div>
    <div class="wx-details">
      <div class="wx-detail">
        <span class="wx-label">Feels like</span>
        <span class="wx-value" data-wx-apparent>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Wind</span>
        <span class="wx-value" data-wx-wind>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Direction</span>
        <span class="wx-value" data-wx-wind-direction>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Precipitation</span>
        <span class="wx-value" data-wx-precip>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Precip chance</span>
        <span class="wx-value" data-wx-precip-prob>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Humidity</span>
        <span class="wx-value" data-wx-humidity>—</span>
      </div>
    </div>
    <small id="wx-meta">
      <span data-wx-location>—</span> ·
      <time data-wx-updated datetime="">—:—</time>
    </small>
  </div>
</section>
