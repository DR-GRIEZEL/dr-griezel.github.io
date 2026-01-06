---
layout: base
title: "Clock Widget"
summary: "Schakel tussen analoge en digitale klokweergave met een A/D-toggle."
image: "/images/widgets/clock.svg"
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/widgets.js
module_js: true
---

<section class="card" aria-labelledby="clock-title" data-widget="clock" data-clock-mode="analog">
  <header><h2 id="clock-title">Klok</h2></header>
  <div class="clock-toggle" role="group" aria-label="Clock view">
    <button type="button" data-clock-toggle="analog" aria-pressed="true">A</button>
    <button type="button" data-clock-toggle="digital" aria-pressed="false">D</button>
  </div>
  <div class="clock-view" data-clock-view="analog">
    <div class="fancy-clock" aria-label="Current time analog clock">
      <div class="clock-face" role="img" aria-hidden="true">
        <div class="clock-hand hour" data-clock-hour></div>
        <div class="clock-hand minute" data-clock-minute></div>
        <div class="clock-hand second" data-clock-second></div>
        <div class="clock-center"></div>
      </div>
      <p class="clock-time" data-clock-time aria-live="polite">--:--:--</p>
    </div>
  </div>
  <div class="clock-view" data-clock-view="digital" hidden>
    <p class="clock-digital" data-clock-time aria-live="polite">--:--:--</p>
  </div>
</section>
