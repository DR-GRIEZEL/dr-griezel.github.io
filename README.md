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

## Tests

Run unit tests with coverage:

```sh
npm test
```

## After setup

### Add a blog post

1. Create a new Markdown file in `blog/` (for example: `blog/my-new-post.md`).
2. Add front matter with the required fields:
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
3. Add the post content below the front matter.

## TODO

- Integrate Google OAuth login and map to Firebase auth.
- Add service worker caching for offline widget data.
- Add RSS/Atom feed for blog posts.
- Expand widget test coverage (weather/error cases).
