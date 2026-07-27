# Ember & Oak Coffee Co.

A responsive marketing website and lightweight, git-based CMS for a
small-batch coffee roastery and café — built as a portfolio piece to
production standards: real tests, real CI, real linting, zero frameworks
to keep loading fast.

> **About this project**: this is a self-directed demo built from a
> realistic client brief, not a site delivered for a paying client. See
> [`docs/CASE-STUDY.md`](docs/CASE-STUDY.md) for the reasoning behind every
> stack choice and an estimated timeline for a real engagement of this scope.

[![CI](https://github.com/MrBoyard7/ember-oak-coffee/actions/workflows/ci.yml/badge.svg)](https://github.com/MrBoyard7/ember-oak-coffee/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/MrBoyard7/ember-oak-coffee/graph/badge.svg)](https://codecov.io/gh/MrBoyard7/ember-oak-coffee)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![Code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> **Note on badges**: the original badge set requested for this project
> (`Python 3.9+`, `black`, ...) is the standard set for a **Python**
> project. This is a static HTML/CSS/JavaScript website, so the badges
> above were adapted to the actual stack (Node tooling, Prettier, no
> Python runtime involved) — using the Python badges here would simply be
> inaccurate.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Editing content (no code required)](#editing-content-no-code-required)
- [CMS setup (Decap CMS)](#cms-setup-decap-cms)
- [SEO & performance](#seo--performance)
- [Google Analytics](#google-analytics)
- [Testing & CI](#testing--ci)
- [Verify it yourself](#verify-it-yourself)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Responsive, four-page marketing site** — Home, Menu, Our Story, Contact
  — down to small mobile widths, with a keyboard-accessible nav.
- **Content-driven, not hard-coded**: menu items, page copy, and the
  announcement banner all live in `/data/*.json` and are fetched at
  runtime, so updating them never touches HTML, CSS, or JS.
- **Built-in CMS** ([Decap CMS](https://decapcms.org)) at `/admin` — a
  login-gated, form-based editor for that same JSON content, comparable to
  a WordPress or Webflow content dashboard, without a server to maintain.
- **On-page SEO**: per-page meta descriptions, Open Graph tags,
  `LocalBusiness` structured data, `sitemap.xml`, `robots.txt`.
- **Performance-conscious by default**: no JS framework runtime, no build
  step, native lazy-loading-ready markup, system-font fallbacks while
  webfonts load.
- **Google Analytics (GA4)** wired up behind a single Measurement ID.
- **Room to grow**: a "coming soon" section and footer links already
  reference future e-commerce and events pages.
- **Automated tests** for both content integrity (JSON schema checks) and
  page structure (nav, meta tags, landmarks), run in CI on every push.

## Tech stack

| Purpose                      | Choice                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Markup / styling / behaviour | Semantic HTML5, plain CSS (custom properties, Grid/Flexbox), vanilla ES modules — no framework, no build step |
| Content                      | JSON files in `/data`, fetched at runtime                                                                     |
| CMS                          | [Decap CMS](https://decapcms.org) (git-based, open source)                                                    |
| Testing                      | Node.js built-in test runner (`node:test`) + [jsdom](https://github.com/jsdom/jsdom)                          |
| Coverage                     | [c8](https://github.com/bcoe/c8) → [Codecov](https://about.codecov.io/)                                       |
| Linting                      | [ESLint](https://eslint.org), [Stylelint](https://stylelint.io), [html-validate](https://html-validate.org)   |
| Formatting                   | [Prettier](https://prettier.io)                                                                               |
| CI                           | GitHub Actions                                                                                                |
| Analytics                    | Google Analytics 4 (`gtag.js`)                                                                                |

Full rationale for each choice — and how it compares to a WordPress or
Webflow build — is in [`docs/CASE-STUDY.md`](docs/CASE-STUDY.md).

## Getting started

Requires [Node.js](https://nodejs.org) 18 or later (for `npm` and the
built-in test runner).

```bash
git clone https://github.com/MrBoyard7/ember-oak-coffee.git
cd ember-oak-coffee
npm install
npm run dev
```

`npm run dev` serves the site at **http://localhost:3000**. A local server
is required (rather than opening `index.html` directly) because the pages
`fetch()` the JSON files in `/data`, which browsers block over the
`file://` protocol.

## Project structure

```text
ember-oak-coffee/
├── .github/
│   └── workflows/
│       └── ci.yml              # Lint, format check, tests, Codecov upload
├── admin/
│   ├── config.yml              # Decap CMS collections (maps to /data/*.json)
│   └── index.html              # Decap CMS entry point (served at /admin)
├── assets/
│   ├── css/
│   │   └── styles.css          # Full design-token system + all page styles
│   ├── img/
│   │   ├── favicon.svg
│   │   └── og-image.svg        # Social share preview image
│   └── js/
│       ├── analytics.js        # GA4 (gtag.js) bootstrap
│       ├── content-loader.js   # Fetches /data/*.json, renders it into the DOM
│       └── main.js             # Nav toggle, announcement banner, scroll reveal
├── data/
│   ├── announcements.json      # Top-of-site banner content
│   ├── menu.json                # Menu categories & items
│   └── site-content.json       # Hero, highlights, story, contact info, footer
├── docs/
│   └── CASE-STUDY.md           # Stack rationale + estimated timeline
├── tests/
│   ├── analytics.test.js       # GA4 bootstrap: placeholder vs. real Measurement ID
│   ├── content-data.test.js    # JSON schema / integrity checks
│   ├── content-loader.test.js  # Rendering, HTML-escaping, fetch-failure handling
│   ├── html-structure.test.js  # Nav, meta tags, landmarks on every page
│   └── main.test.js            # Nav toggle, announcement banner, footer year
├── .eslintrc.json
├── .gitignore
├── .htmlvalidate.json
├── .prettierignore
├── .prettierrc.json
├── .stylelintrc.json
├── 404.html
├── about.html
├── CONTRIBUTING.md
├── contact.html
├── index.html
├── LICENSE
├── menu.html
├── package.json
├── README.md
├── robots.txt
├── site.webmanifest
└── sitemap.xml
```

## Editing content (no code required)

All day-to-day content lives in three files:

| File                      | Controls                                                                        |
| ------------------------- | ------------------------------------------------------------------------------- |
| `data/site-content.json`  | Homepage hero/highlights, the "Our Story" page, contact details & hours, footer |
| `data/menu.json`          | Every menu category and item                                                    |
| `data/announcements.json` | The dismissible banner at the top of every page                                 |

Editing any of these files directly (and refreshing the browser) updates
the live content — no HTML/CSS/JS knowledge required, just valid JSON. For
a non-technical owner, the `/admin` CMS below provides the same thing
through a form UI instead of raw JSON.

To update photos: add the image to `assets/img/`, then reference its path
from the relevant JSON field or HTML `<img>`/`background` — or, more simply,
upload it through the CMS media picker described below.

## CMS setup (Decap CMS)

The `/admin` route ships with a complete Decap CMS configuration
(`admin/config.yml`) mapped to the three JSON files above. Two setup paths:

### Option A — try it locally first (no deployment needed)

```bash
npm run dev
npx decap-server
```

With both running, visit `http://localhost:3000/admin` — Decap CMS will
read and write the JSON files directly on disk via `decap-server`, which is
enough to try the editing experience before wiring up real authentication.

### Option B — live site with a real login

1. Deploy the site (see [Deployment](#deployment)) to a host that can
   provide GitHub OAuth for Decap CMS — the simplest free option is
   [Netlify](https://docs.netlify.com/manage/security/secure-access-to-netlify/git-gateway/),
   even if the site itself is ultimately hosted elsewhere; Netlify's OAuth
   provider works for any git backend.
2. In `admin/config.yml`, confirm `backend.repo` points at
   `MrBoyard7/ember-oak-coffee` (or the real repo name, once renamed).
3. Push the repo to GitHub and connect it in Netlify (or your chosen OAuth
   provider) to enable the `/admin` login screen.
4. Hand the `/admin` URL and login credentials to whoever will be
   maintaining content — a 15–20 minute walkthrough covers editing the
   menu, updating the announcement banner, and uploading a photo.

## SEO & performance

- Each page has a unique `<title>` and `<meta name="description">`.
- Open Graph tags and a shared `assets/img/og-image.svg` control how the
  site previews when shared on social platforms.
- `index.html` includes `LocalBusiness`-flavoured (`CafeOrCoffeeShop`)
  [schema.org](https://schema.org) structured data for richer search
  results.
- `sitemap.xml` and `robots.txt` are included at the site root — update
  the domain in both once the real production URL is known.
- No JS framework runtime, no build step, and system-font fallbacks keep
  first paint fast; run a Lighthouse pass after deployment to confirm
  real-world numbers on your chosen host.

## Google Analytics

Every page loads `assets/js/analytics.js`, which reads
`window.GA_MEASUREMENT_ID` (set inline near the top of each page's
`<head>`). To connect a real GA4 property:

1. Create a GA4 property and copy its Measurement ID (`G-XXXXXXXXXX`).
2. Replace **both** occurrences of `G-XXXXXXXXXX` in every HTML file (the
   inline `window.GA_MEASUREMENT_ID = ...` and the `gtag/js?id=...` script
   `src`) with the real ID.
3. Redeploy. Until the placeholder is replaced, `analytics.js` logs a
   console notice and sends nothing, so local development never pollutes
   real analytics data.

## Testing & CI

```bash
npm test              # run the test suite once
npm run test:coverage # run with coverage, writes coverage/lcov.info
npm run lint           # ESLint + Stylelint + html-validate
npm run format:check   # Prettier, check-only
```

GitHub Actions (`.github/workflows/ci.yml`) runs the full lint + format +
test suite on Node 18 and 20 for every push and pull request to `main`,
then uploads coverage to Codecov. To enable the Codecov badge on your own
fork: add a `CODECOV_TOKEN` secret in the repo's Settings → Secrets and
Actions (Codecov issues this token when you connect the repo at
[codecov.io](https://about.codecov.io/)).

## Verify it yourself

Every command below can be run right after cloning — nothing here is
aspirational.

```bash
# 1. Clone and install
git clone https://github.com/MrBoyard7/ember-oak-coffee.git
cd ember-oak-coffee
npm install

# 2. Lint everything (JS, CSS, HTML)
npm run lint

# 3. Confirm formatting matches Prettier's rules
npm run format:check

# 4. Run the automated test suite
npm test

# 5. Run it with coverage (writes ./coverage/lcov.info + prints a summary)
npm run test:coverage

# 6. Serve the site locally and open it in a browser
npm run dev
# -> visit http://localhost:3000

# 7. (optional) Try the CMS editing screen locally
npx decap-server
# -> with `npm run dev` also running, visit http://localhost:3000/admin
```

Expected results: steps 2–5 exit with status `0` and no errors; step 6
serves the four pages with working navigation, a rendered menu, and a
working (client-side) contact form.

## Deployment

The site is a static bundle — every file can be uploaded as-is to any
static host or traditional hosting plan:

- **Static hosts** (Netlify, Vercel, GitHub Pages, Cloudflare Pages): point
  the host at this repository; no build command is required (leave the
  "build command" blank or set it to a no-op — there's no compilation
  step).
- **Traditional hosting (cPanel/FTP, etc.)**: upload every file in this
  repository except `node_modules/`, `.github/`, `tests/`, and the config
  dotfiles to the hosting root (typically `public_html/`).

After deploying: update the domain in `sitemap.xml`, `robots.txt`, and the
`og:url`/`canonical` tags in each HTML file, then submit the sitemap in
Google Search Console.

## Roadmap

- [ ] Online bean shop (e-commerce)
- [ ] Public events & cuppings calendar
- [ ] Email newsletter signup (ESP integration)
- [ ] Swap the `mailto:` contact form for a hosted form endpoint

## Contributing

Bug reports and pull requests are welcome — see
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the local setup and checklist
before opening a PR.

## License

Released under the [MIT License](LICENSE).

Copyright (c) 2026 Prince Boyard MBOUNGOU NGOMA

---

Built by [Prince Boyard MBOUNGOU NGOMA](https://github.com/MrBoyard7)
(**MrBoyard7**).
