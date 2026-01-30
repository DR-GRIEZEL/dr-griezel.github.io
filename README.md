# [dr-griezel.github.io](https://dr-griezel.github.io) (Template)

## General

<!-- Badges -->

![GitHub stars](https://img.shields.io/github/stars/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)
![Repo size](https://img.shields.io/github/repo-size/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)
![Top language](https://img.shields.io/github/languages/top/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)

## Releases

![Release](https://img.shields.io/github/v/release/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)
![License](https://img.shields.io/github/license/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)

## Quality Control

![CI](https://img.shields.io/github/actions/workflow/status/DR-GRIEZEL/dr-griezel.github.io/codeql.yml?style=for-the-badge)
![CI](https://img.shields.io/github/actions/workflow/status/DR-GRIEZEL/dr-griezel.github.io/ci.yml?style=for-the-badge)

## Updates

![Contributors](https://img.shields.io/github/contributors/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)
![Last commit](https://img.shields.io/github/last-commit/DR-GRIEZEL/dr-griezel.github.io?style=for-the-badge)

---

# Overview

## 📌 Framework overview

- **Jekyll (static site generator)**: Markdown/HTML pages are compiled with layouts and includes.
- **Layouts**: `src/_layouts/base.html` composes the page chrome (sidebar, header, footer, main content).
- **Includes**: `src/_includes/nav.html`, `src/_includes/header.html`, `src/_includes/footer.html` are partials injected by layouts.
- **Static assets**: `src/assets/css` and `src/assets/js` hold styling and behavior modules.

### Module interactions (low-level)

- **Navigation pipeline**
  - Jekyll loads pages from `src/html/nav/`.
  - `src/_includes/nav.html` filters `site.pages` to build sidebar links.
  - `nav_label` and `nav_order` in each page control label and order.
- **Layout pipeline**
  - `src/_layouts/base.html` renders the layout, then injects `page.css` and `page.js` lists.
  - `src/assets/js/site.js` runs globally for layout behaviors (sidebar toggles, etc.).
- **Widget pipeline**
  - `src/html/nav/index.html` composes widgets by rendering pages from `/widgets/`.
  - `src/assets/js/widgets/widgets.js` provides clock/weather helpers.
  - `src/assets/js/widgets/pomodoro-core.js` handles timer state and formatting.
  - `src/assets/js/widgets/pomodoro.js` binds UI to the pomodoro core.
- **Updates pipeline**
  - `src/html/nav/updates.html` loads `src/assets/js/updates.js` as a module.
  - `updates.js` fetches GitHub commits and renders them into the updates list.

## 📁 Directory structure

```
.
├── assets -> src/assets  # Symlink for Jekyll static output
├── blog/                 # Blog post markdown entries
├── config/
│   ├── _config.yml       # Jekyll config
│   ├── firebase-config.js
│   └── github_config.js
├── src/
│   ├── _includes/        # Jekyll partials (nav/header/footer)
│   ├── _layouts/         # Base layout
│   ├── assets/
│   │   ├── css/          # Stylesheets
│   │   ├── img/          # Icons and illustrations
│   │   └── js/           # JS modules (widgets, pomodoro, updates)
│   ├── html/
│   │   ├── nav/          # Pages that appear in the sidebar
│   │   ├── 404.html
│   │   └── 500.html
│   ├── widgets/          # Widget partial pages
│   └── test/             # Vitest unit tests
├── package.json
└── README.md
```

# Tutorial

## 1. Firebase login setup

Set your Firebase client config in `config/firebase-config.js` (served as
`/config/firebase-config.js` in the built site). Keep values in sync with your Firebase Web app:

```js
export const firebaseConfig = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
  measurementId: 'FIREBASE_MEASUREMENT_ID',
};
```

1. Create a Firebase project, register a Web app, and paste the config values into
   `config/firebase-config.js`.
2. If you register a new Google OAuth client, update `googleClientId` in
   `src/assets/js/login/login-buttons.js` so Firebase auth uses the correct client ID.

## 2. GitHub updates config

The Updates page pulls commits based on `config/github_config.js`. Update `owner` and `repo` if you
fork the site so the updates page points at the correct GitHub repository.

## 3. Self-hosting tutorial

### Option A: Jekyll (local build)

1. Install Ruby and Jekyll.
   ```sh
   gem install jekyll
   ```
2. Build and serve the site locally:
   ```sh
   jekyll serve --config config/_config.yml --livereload
   ```
3. Visit `http://localhost:4000`.

### Option B: static hosting (prebuilt)

1. Build the site:
   ```sh
   jekyll build --config config/_config.yml
   ```
2. Upload the `_site/` directory to any static host (Nginx, Apache, S3, etc.).

### Option C: Python static server (quick preview)

1. Build the site:
   ```sh
   jekyll build --config config/_config.yml
   ```
2. Serve the output locally:
   ```sh
   python -m http.server 8000 --directory _site
   ```
3. Visit `http://localhost:8000`.

## Local tooling

Install the Node dependencies that back the tests and linting:

```sh
npm install
```

Before committing, keep the formatting and linting tools happy:

```sh
npm run format
npm run lint
```

Run the unit tests (Vitest is configured to emit coverage):

```sh
npm test
```

## Customisation

### Add new pages

1. Create .html file in `/src/html/nav/`
2. Add front matter:

```yaml
---
layout: base
title: 'My Page'
nav_label: 'My Page'
nav_order: 100
permalink: /my-page/
css:
  - /assets/css/main.css
module_js: true
---
```

3. Optional field: `req_login` hides pages when not logged in.

> `nav_order` should not be the same number as any other page inside `/src/html/nav`.

### Add a widget

1. Put js file in `src/assets/js/widgets`
2. Create .md file in `/src/widgets`
3. Add front matter:

```yaml
---
layout: base
title: 'My Widget'
summary: 'A custom widget.'
image: '/assets/img/widgets/my-widget.svg'
css:
  - /assets/css/main.css
  - /assets/css/dash.css
js:
  - /assets/js/widgets/my-widget.js
module_js: true
---
```

### Add a blog post

1. Create new .md file in `blog/` (for example: `blog/my-new-post.md`).
2. Add front matter:
   ```yaml
   ---
   layout: blog
   title: 'Post title'
   subtitle: 'Post subtitle'
   css:
     - /assets/css/main.css
   image: '/assets/img/blog/your-image.svg'
   date: 2024-01-12
   ---
   ```
3. Add post content below front matter.
4. Images should be in `src/assets/img/blog`. (Temporarily -- see TODO)

# Roadmap & Todo's

## ✅ TODO

- **Widget Ideas:**
  - unix/dt/iso converter

- **Login:**
  - [ ] Add verification method after auth to access data: automatically assign gmail/github accounts to discord (user_id, username, profile picture, ...) -> via Discord API: 1. in-app (creating manual registration command which generates a one-time code (copy code or generate encrypted URL?) every session)
  - [-] User settings page

- **On-site blog creator with login protection**

> Current tags: 🧠 Models, ⚙️ Systems, 🧪 Labs, 🔐 Security, 📈 Markets

- [?] Scan API for frontpage metadata, pull blog content upon clicking link
- [ ] Create post (title, desc frontmatter fields, choose from preset tags (emoji) ( category/folder, body = textbox) -> ~~Send data via API~~ (Store .md files internally for now)
- [?] Drop image self-hosting entirely if API usage increases too much (Try compression first)

- [ ] upon file editor creation, force tag selection to make sure files are always categorised.
- [ ] Filter tags based directory: `blog/{tag}/` -> add filter menu displaying all available tags.
- [ ] seperate cover images from blog images; `{tag}/images/covers/`
- [ ] put website metadata images inside /assets/img/

Not sure, needs more research/refinement:

- [?] integrate like/comment system
- [?] generate svg based on title/tag (enter title -> generate .svg img -> attach .svg link to frontmatter (requires ChatGPT API)
- [ ] Edit existing articles in editor

- **Easy of use for non-coders:**
- [x] move the blog content to `/blog` and keep config in `/config`.
  - [ ] put configurable images inside `config/images/`
  - [ ] prefab css stylings (per user themes)

- **General fixes & features:**
  - [ ] Harden Firebase security rules and add login flow tests.
  - [ ] Add service worker caching for offline widget data.
  - [ ] Add RSS/Atom feed for blog posts.
