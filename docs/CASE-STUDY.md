# Case Study: Ember & Oak Coffee Co.

## What this is

This repository is a self-directed portfolio project: a fictional coffee
shop ("Ember & Oak Coffee Co.") built end-to-end from a realistic client
brief, to demonstrate how I approach a small-business marketing site —
design, front-end build, content workflow, SEO/analytics, testing, and CI —
in one place a prospective client can inspect directly.

It is not a site built for a paying client. Nothing in this repository or
README should be read as a claim otherwise. What it _does_ show accurately:
real, runnable code, a real automated test suite, and a real CI pipeline —
you can clone it and verify every claim yourself (see the README's
"Verify it yourself" section).

## The brief

> A responsive, visually inviting website for a coffee shop. Easy navigation
> for menu, story, and contact, room to grow into e-commerce/events. A CMS
> non-technical staff can use to update photos, menu, and announcements.
> Basic on-page SEO, speed, and Google Analytics. Deployment plus a short
> post-launch support window.

## Stack, and why

| Layer          | Choice                                                                                     | Why                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front end      | Static HTML/CSS/vanilla JS, no framework                                                   | A five-page marketing site doesn't need a JS framework's runtime cost. Faster to ship, faster to load, nothing to go out of date.                                                                                                                                                                   |
| Content        | JSON files in `/data`, loaded at runtime                                                   | Menu items, announcements, and page copy live outside the markup, so updating them never means touching HTML/CSS/JS.                                                                                                                                                                                |
| CMS            | [Decap CMS](https://decapcms.org) (git-based, open source)                                 | Gives a non-technical owner a real login screen and form-based editor — comparable to WordPress/Webflow — without the hosting overhead, plugin maintenance, or attack surface of a full WordPress install. Every save is a Git commit, so there's a full history and nothing to back up separately. |
| Hosting target | Any static host (Netlify, Vercel, GitHub Pages, or the client's own hosting via FTP/rsync) | No server runtime or database to keep patched.                                                                                                                                                                                                                                                      |
| Analytics      | GA4 (gtag.js)                                                                              | Client's existing requirement; wired up behind a single Measurement-ID variable.                                                                                                                                                                                                                    |
| CI             | GitHub Actions: lint, format check, unit tests, coverage → Codecov                         | Catches broken JSON, broken markup, and broken JS before it reaches production.                                                                                                                                                                                                                     |

**When I'd reach for WordPress or Webflow instead:** if the client's team
wants a large, ever-growing content team publishing blog posts daily, or
needs a plugin ecosystem (bookings, memberships, complex e-commerce) rather
than "photos, menu, announcements." For the brief as written — three types
of content, a small team, and a future (not immediate) e-commerce need —
a static site with a git-based CMS is faster to build, faster to load,
and cheaper to run indefinitely.

## Estimated timeline for a real engagement

| Phase               | Duration         | Deliverable                                                       |
| ------------------- | ---------------- | ----------------------------------------------------------------- |
| Discovery & content | 2–3 days         | Sitemap sign-off, copy and photo collection from the client       |
| Design              | 3–4 days         | Token system (color/type/layout) and a homepage comp for approval |
| Build               | 4–6 days         | All pages, responsive, CMS wired up, SEO/analytics in place       |
| QA & content load   | 2 days           | Cross-browser/device pass, Lighthouse pass, real content loaded   |
| Launch & handover   | 1 day            | DNS/deploy, CMS login handed over, 15–20 min recorded walkthrough |
| Post-launch support | 10 business days | Bug fixes and small tweaks at no extra cost                       |

**Total: roughly 3 weeks** from kickoff to launch for a site at this scope,
assuming the client turns around content/photo feedback within 2 business
days at each checkpoint. E-commerce or an events calendar, if added later,
would be scoped and quoted separately.

## What's stubbed vs. what's real

To keep this a repository you can actually run and inspect rather than a
mockup, some pieces that would depend on a live client account are wired up
but left as clearly-marked placeholders:

- **Google Analytics**: the gtag.js snippet is real and functional; the
  Measurement ID is a placeholder (`G-XXXXXXXXXX`) since it's tied to a
  specific Google account.
- **Decap CMS backend**: `admin/config.yml` is a complete, working
  configuration; it needs a real Git repository and an OAuth provider
  (documented in the README) before the login screen will authenticate.
- **Contact form**: submits via `mailto:` so it works with zero backend.
  For a live site I'd swap this for a hosted form endpoint (e.g. Formspree)
  in about ten minutes — noted inline in `contact.html`.
- **Photography**: replaced with an original SVG illustration set (roast
  dial, map) rather than stock photography, so nothing in the repo is
  under someone else's copyright.
