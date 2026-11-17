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

This is a minimal Gatsby 5 static site — a single-page personal portfolio for Mert Tosun.

**Content pipeline (Notion CMS):** All content comes from Notion at build time. `gatsby-node.js` calls `src/notion/fetch.js`, which queries the data sources listed in `notion.config.js` (Site Pages, Links, Projects, Studio Projects, Publications, Teaching) through the official API (`@notionhq/client`, data-sources API). Only rows with `Published` ticked are pulled. Page bodies are converted with `notion-to-md` + `marked`, and Notion-hosted images/files/covers are downloaded to `public/notion-media/` because Notion file URLs expire. Everything becomes `NotionEntry` GraphQL nodes (explicit schema in `gatsby-node.js`). The CMS hub in Notion is the page "mert.works CMS".

**Routing:** `src/pages/index.js` = home (Site Pages row with slug `home` + Links). Section pages (`/projects/`, `/studio/`, `/teaching/`, `/publications/`) are created from `src/templates/section.js` only when their Site Pages row is published. Rows with `Detail page` ticked get `/<section>/<slug>/` from `src/templates/entry.js`. `src/components/layout.js` holds the nav for inner pages.

**Publishing:** `.github/workflows/daily-rebuild.yml` hits the Netlify build hook (secret `NETLIFY_BUILD_HOOK`) daily at 06:00 Istanbul; it can also be run manually from GitHub Actions.

**Offline testing:** set `NOTION_FIXTURE=/path/to/entries.json` (an array of normalised entries) to build without the Notion API.

**Styling:** `src/styles/global.css` — single stylesheet with CSS custom properties (`--font-color`, `--hover-color`), Inter font via Google Fonts, and a max-width 800px centered container.

**SEO:** `src/components/seo.js` uses `react-helmet` and pulls defaults from `gatsby-config.js` `siteMetadata`.

**Static assets:** Files placed in `./static/` are copied verbatim to `public/` at build time (e.g. the CV PDF).

## Environment

Requires a `.env` file (not committed), see `.env.example`:
```
GOOGLE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
NOTION_TOKEN=ntn_...   # Notion internal integration secret; also set in Netlify env vars
```
