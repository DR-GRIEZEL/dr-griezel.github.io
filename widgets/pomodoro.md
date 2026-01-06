---
layout: base
title: 'Pomodoro Widget'
summary: 'Focus-timer met pauzes, status en voortgangsbalk.'
image: '/assets/images/widgets/pomodoro.svg'
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/pomodoro.js
module_js: true
---

<section class="card" aria-label="Pomodoro" data-widget="pomodoro" data-pomo-id="main">
  <div class="pomo-widget" role="group" aria-label="Pomodoro timer">
    <div class="pomo-timer focus" data-pomo-time aria-live="polite">25:00</div>
    <div class="pomo-sub" data-pomo-state>Focus</div>

    <div class="pomo-progress" aria-hidden="true">
      <div class="pomo-progress-bar" data-pomo-bar style="width:0%"></div>
    </div>

    <div class="pomobar">
      <button class="pomo-btn" type="button" data-pomo-start aria-label="Start">▶️</button>
      <button class="pomo-btn" type="button" data-pomo-pause aria-label="Pause">⏸️</button>
      <button class="pomo-btn" type="button" data-pomo-break aria-label="Short break (5 minutes)">☕</button>
      <button class="pomo-btn" type="button" data-pomo-reset aria-label="Reset">🔄</button>
    </div>

  </div>
</section>
