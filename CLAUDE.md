# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run develop   # local dev server at localhost:8000
npm run build     # production build to public/
npm run serve     # serve the production build locally
npm run clean     # clear .cache/ and public/ (use when builds behave unexpectedly)
```

## Architecture

This is a minimal Gatsby 5 static site — a personal portfolio for Mert Tosun at mert.works.

**Pages:**
- `src/pages/index.js` — homepage (bio, links)
- `src/pages/projects.js` — projects listing with tag filtering
- `src/pages/404.js`

**Content pipeline:** Markdown files are transformed by `gatsby-transformer-remark` and queried via GraphQL at build time.
- Homepage bio: `src/pages/home.md` — queried in `index.js` with `fileAbsolutePath` filter for `src/pages/`
- Projects: one `.md` file per project in `src/content/projects/` — queried in `projects.js` with `fileAbsolutePath` filter for `src/content/projects/`

**Project frontmatter structure:**
```yaml
title: "Project Title"
summary: "Short description."
image: "../../images/projects/image.jpg"   # relative path to src/images/projects/
date: "2025-01-15"                          # ISO date — used for DESC sort, limit 7
tags: ["Research", "Industrial Design"]    # drives tag filter bar on projects page
link: "https://..."                         # optional — renders "more about this project →"
```

**Projects page behavior:**
- Shows the 7 most recent projects sorted by `date DESC`
- Tag filter bar at top — client-side filtering via React `useState`
- Card layout: image left (300×300, cropped), content right (title, summary, tags, optional link)
- Responsive: stacks vertically at ≤600px

**Images:** Project images go in `src/images/projects/`. They are processed by `gatsby-plugin-image` / `gatsby-plugin-sharp` and referenced via frontmatter relative paths.

**Styling:** `src/styles/global.css` — single stylesheet with CSS custom properties (`--font-color: #b2b2b2`, `--hover-color: #000`), Inter font, max-width 800px container.

**SEO:** `src/components/seo.js` uses `react-helmet`, falls back to `gatsby-config.js` siteMetadata.

**Static assets:** Files in `./static/` are copied verbatim to `public/` at build time (e.g. the CV PDF).

## Environment

Requires a `.env` file (not committed) with:
```
GOOGLE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```
