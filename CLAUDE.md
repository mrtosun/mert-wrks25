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

**Content pipeline:** Page content lives in `src/pages/home.md` as a Markdown file with YAML frontmatter (`title`). At build time, `gatsby-transformer-remark` converts it to HTML. `src/pages/index.js` queries it via GraphQL (`allMarkdownRemark`) and renders the title and HTML directly (`dangerouslySetInnerHTML`). To update the bio or page text, edit `home.md`.

**Routing:** There are only two pages — `src/pages/index.js` (home) and `src/pages/404.js`. External links (CV, Notion, LinkedIn, Behance, Instagram) are hardcoded in `index.js`.

**Styling:** `src/styles/global.css` — single stylesheet with CSS custom properties (`--font-color`, `--hover-color`), Inter font via Google Fonts, and a max-width 800px centered container.

**SEO:** `src/components/seo.js` uses `react-helmet` and pulls defaults from `gatsby-config.js` `siteMetadata`.

**Static assets:** Files placed in `./static/` are copied verbatim to `public/` at build time (e.g. the CV PDF).

## Environment

Requires a `.env` file (not committed) with:
```
GOOGLE_ANALYTICS_TRACKING_ID=G-XXXXXXXXXX
```
