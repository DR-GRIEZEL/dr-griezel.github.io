# dr-griezel.github.io

#### Dashboard built with Jekyll layouts and vanilla HTML/CSS/JS.

## Framework overview

- **Jekyll (static site generator)**: Markdown/HTML pages are compiled with layouts and includes.
- **Layouts**: `_layouts/base.html` composes the page chrome (sidebar, header, footer, main content).
- **Includes**: `_includes/nav.html`, `_includes/header.html`, `_includes/footer.html` are partials injected by layouts.
- **Static assets**: `assets/css` and `assets/js` hold styling and behavior modules.

### Module interactions (low-level)

- **Navigation pipeline**
  - Jekyll loads pages from `html/nav/`.
  - `_includes/nav.html` filters `site.pages` to build sidebar links.
  - `nav_label` and `nav_order` in each page control label and order.
- **Layout pipeline**
  - `_layouts/base.html` renders the layout, then injects `page.css` and `page.js` lists.
  - `assets/js/site.js` runs globally for layout behaviors (sidebar toggles, etc.).
- **Widget pipeline**
  - `html/nav/index.html` composes widgets by rendering pages from `/widgets/`.
  - `assets/js/widgets/widgets.js` provides clock/weather helpers.
  - `assets/js/widgets/pomodoro-core.js` handles timer state and formatting.
  - `assets/js/widgets/pomodoro.js` binds UI to the pomodoro core.
- **Updates pipeline**
  - `html/nav/updates.html` loads `assets/js/updates.js` as a module.
  - `updates.js` fetches GitHub commits and renders them into the updates list.

## Directory structure

```
.
├── _includes/            # Jekyll partials (nav/header/footer)
├── _layouts/             # Base layout
├── _data/                # Jekyll data (currently unused)
├── assets/
│   ├── css/              # Stylesheets
│   ├── images/           # Icons and illustrations
│   └── js/               # JS modules (widgets, pomodoro, updates)
├── blog/                 # Blog post markdown entries
├── html/
│   ├── nav/              # Pages that appear in the sidebar
│   ├── 404.html
│   └── 500.html
├── widgets/              # Widget partial pages
├── test/                 # Vitest unit tests
├── _config.yml           # Jekyll config
├── package.json
└── README.md
```

## Firebase login setup

The footer login buttons use Firebase Authentication to sign in with Google or GitHub. To run the flow locally you need to swap in your own Firebase project values:

1. Create or reuse a Firebase project, register a Web app, and paste the config object into `assets/js/login/firebase-config.js`. The module exports `firebaseConfig` and a readiness check (`isFirebaseConfigReady`); the login script displays a warning if the config is still missing or contains the `'...'` placeholders.
2. Enable the Google and GitHub sign-in providers and add your local (`http://localhost:4000`) and hosted (`https://dr-griezel.github.io/`) domains to the authorized list. Make sure the OAuth redirect URIs match the domains where you expect the buttons to run.
3. If you register a new Google OAuth client, update the `googleClientId` constant in `assets/js/login/login-buttons.js` so the Firebase providers use the correct client ID.
4. Keep your Firebase security rules and GitHub client secret locked down—these frontend keys are public by design, so proper server-side rules are what prevent abuse.

## Self-hosting tutorial

### Option A: Jekyll (local build)

1. Install Ruby and Jekyll.
   ```sh
   gem install jekyll
   ```
2. Build and serve the site locally:
   ```sh
   jekyll serve --livereload
   ```
3. Visit `http://localhost:4000`.

### Option B: static hosting (prebuilt)

1. Build the site:
   ```sh
   jekyll build
   ```
2. Upload the `_site/` directory to any static host (Nginx, Apache, S3, etc.).

### Option C: Python static server (quick preview)

1. Build the site:
   ```sh
   jekyll build
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

## After setup

### Add new pages

1. Create .html file in `/html/nav/`
2. Add front matter:
```yaml
---
layout: base
title: "My Page"
nav_label: "My Page"
nav_order: 100
permalink: /my-page/
css:
  - /assets/css/main.css
module_js: true
---
```
>`nav_order` should not be the same number as any other page inside `/html/nav`.

### Add a widget

1. Put js file in `assets/js/widgets`
2. Create .md file in `/widgets`
3. Add front matter:
  ```yaml
  ---
  layout: base
  title: 'My Widget'
  summary: 'A custom widget.'
  image: '/assets/images/widgets/my-widget.svg'
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
   image: '/assets/images/blog/your-image.svg'
   date: 2024-01-12
   ---
   ```
3. Add post content below front matter.
4. Images should be in `assets/images/blog`.

## TODO

- On-site blog creator with login protection
  - upon file editor creation, force tag selection to make sure files are always categorised.
  - Filter tags based directory: `blog/{tag}/` -> add filter menu displaying all available tags.
  - seperate cover images from blog images; `{tag}/images/covers/`

- Harden Firebase security rules and add login flow tests.
- Add service worker caching for offline widget data.
- Add RSS/Atom feed for blog posts.
