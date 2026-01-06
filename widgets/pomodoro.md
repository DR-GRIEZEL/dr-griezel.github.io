---
layout: base
title: "Pomodoro Widget"
summary: "Focus-timer met pauzes, status en voortgangsbalk."
image: "/images/widgets/pomodoro.svg"
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/pomodoro.js
module_js: true
---

<section class="card" aria-labelledby="pomo-title" data-widget="pomodoro" data-pomo-id="main">
  <header><h2 id="pomo-title">Pomodoro</h2></header>

  <div class="pomo-widget" role="group" aria-describedby="pomo-title">
    <div class="pomo-timer focus" data-pomo-time aria-live="polite">25:00</div>
    <div class="pomo-sub" data-pomo-state>Focus</div>

    <div class="pomo-progress" aria-hidden="true">
      <div class="pomo-progress-bar" data-pomo-bar style="width:0%"></div>
    </div>

    <div class="pomobar">
      <button class="pomo-btn" type="button" data-pomo-start>Start</button>
      <button class="pomo-btn" type="button" data-pomo-pause>Pauze</button>
      <button class="pomo-btn" type="button" data-pomo-break>Pauze (5m)</button>
      <button class="pomo-btn" type="button" data-pomo-reset>Reset</button>
    </div>
  </div>
</section>
