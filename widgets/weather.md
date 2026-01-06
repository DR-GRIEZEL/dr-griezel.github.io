---
layout: base
title: "Weather Widget"
summary: "Realtime weer met extra details zoals gevoelstemperatuur, wind en neerslagkans."
image: "/assets/images/widgets/weather.svg"
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/widgets.js
module_js: true
---

<section class="card" aria-labelledby="wx-title" data-widget="weather">
  <header><h2 id="wx-title">Weer</h2></header>
  <div class="wxbox" role="group" aria-describedby="wx-meta">
    <div class="wxline">
      <strong class="wx-temp" data-wx-temp>--°</strong>
      <span class="wx-desc" data-wx-desc>—</span>
    </div>
    <div class="wx-details">
      <div class="wx-detail">
        <span class="wx-label">Gevoel</span>
        <span class="wx-value" data-wx-apparent>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Wind</span>
        <span class="wx-value" data-wx-wind>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Richting</span>
        <span class="wx-value" data-wx-wind-direction>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Neerslag</span>
        <span class="wx-value" data-wx-precip>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Neerslagkans</span>
        <span class="wx-value" data-wx-precip-prob>—</span>
      </div>
      <div class="wx-detail">
        <span class="wx-label">Vochtigheid</span>
        <span class="wx-value" data-wx-humidity>—</span>
      </div>
    </div>
    <small id="wx-meta">
      <span data-wx-location>—</span> ·
      <time data-wx-updated datetime="">—:—</time>
    </small>
  </div>
</section>
