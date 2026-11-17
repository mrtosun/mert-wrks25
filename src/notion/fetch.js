/**
 * Pulls published content from Notion at build time and normalises it into plain objects.
 * Used by gatsby-node.js. Notion-hosted files (images, covers, videos, PDFs) are downloaded
 * into public/notion-media because Notion's file links expire after about an hour.
 */
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const { Client } = require("@notionhq/client")
const { NotionToMarkdown } = require("notion-to-md")
const { marked } = require("marked")
const config = require("../../notion.config")

const MEDIA_DIR = path.join(process.cwd(), "public", "notion-media")
const MEDIA_URL = "/notion-media"

const plain = rich => (rich || []).map(t => t.plain_text).join("")

const escapeHtml = s =>
  String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))

function prop(page, name) {
  const p = page.properties[name]
  if (!p) return null
  switch (p.type) {
    case "title": return plain(p.title)
    case "rich_text": return plain(p.rich_text)
    case "number": return p.number
    case "checkbox": return p.checkbox
    case "url": return p.url
    case "select": return p.select ? p.select.name : null
    case "multi_select": return p.multi_select.map(o => o.name)
    case "date": return p.date ? p.date.start : null
    default: return null
  }
}

const TR = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" }
const slugify = s =>
  String(s || "")
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, c => TR[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

async function download(url) {
  const u = new URL(url)
  let ext = path.extname(decodeURIComponent(u.pathname)).toLowerCase()
  if (!/^\.[a-z0-9]{1,5}$/.test(ext)) ext = ".bin"
  // The S3 path is stable for a given file, only the signature in the query changes
  const name = crypto.createHash("sha1").update(u.origin + u.pathname).digest("hex").slice(0, 16) + ext
  const dest = path.join(MEDIA_DIR, name)
  if (!fs.existsSync(dest)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Could not download ${u.pathname} (HTTP ${res.status})`)
    fs.mkdirSync(MEDIA_DIR, { recursive: true })
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  }
  return `${MEDIA_URL}/${name}`
}

// Notion file object -> usable URL (downloads Notion-hosted files)
async function fileUrl(obj) {
  if (!obj) return null
  if (obj.type === "external") return obj.external.url
  if (obj.type === "file") return download(obj.file.url)
  return null
}

function youtubeEmbed(url) {
  const m = String(url).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/)
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null
}

function makeConverter(notion) {
  const n2m = new NotionToMarkdown({ notionClient: notion, config: { separateChildPage: false } })

  n2m.setCustomTransformer("image", async block => {
    const src = await fileUrl(block.image)
    if (!src) return ""
    const caption = plain(block.image.caption)
    return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(caption)}" loading="lazy" />${
      caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
    }</figure>`
  })

  n2m.setCustomTransformer("video", async block => {
    const v = block.video
    if (v.type === "external") {
      const embed = youtubeEmbed(v.external.url)
      if (embed) return `<div class="embed"><iframe src="${embed}" title="Video" allowfullscreen loading="lazy"></iframe></div>`
      return `<p><a href="${escapeHtml(v.external.url)}">Watch video →</a></p>`
    }
    const src = await fileUrl(v)
    return src ? `<figure><video src="${escapeHtml(src)}" controls preload="metadata"></video></figure>` : ""
  })

  for (const type of ["file", "pdf"]) {
    n2m.setCustomTransformer(type, async block => {
      const f = block[type]
      const src = await fileUrl(f)
      if (!src) return ""
      const label = plain(f.caption) || f.name || "Download file"
      return `<p><a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} →</a></p>`
    })
  }

  // Child pages and databases are Notion-internal; don't leak them onto the site
  n2m.setCustomTransformer("child_page", () => "")
  n2m.setCustomTransformer("child_database", () => "")

  return async pageId => {
    const blocks = await n2m.pageToMarkdown(pageId)
    const md = n2m.toMarkdownString(blocks).parent || ""
    return { md, html: marked.parse(md, { gfm: true }) }
  }
}

// First real paragraph of the body as plain text, used when Summary is empty
function excerpt(md, max = 220) {
  const para = (md || "")
    .split(/\n{2,}/)
    .map(s => s.trim())
    .find(s => s && !/^(#|<|!\[|-|\*\s|\d+\.|>|```)/.test(s))
  if (!para) return ""
  const text = para.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim()
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text
}

async function queryAll(notion, dataSourceId) {
  const rows = []
  let cursor
  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: "Published", checkbox: { equals: true } },
      start_cursor: cursor,
      page_size: 100,
    })
    rows.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return rows
}

async function loadFromNotion(reporter, client) {
  const notion = client || new Client({ auth: process.env.NOTION_TOKEN })
  const toHtml = makeConverter(notion)
  const entries = []

  for (const [collection, dataSourceId] of Object.entries(config.dataSources)) {
    let rows
    try {
      rows = await queryAll(notion, dataSourceId)
    } catch (err) {
      throw new Error(
        `[notion] Could not read "${collection}" (${dataSourceId}): ${err.message}\n` +
          `Make sure that database is connected to your Notion integration.`
      )
    }
    reporter.info(`[notion] ${collection}: ${rows.length} published`)

    const usedSlugs = new Set()
    for (const page of rows) {
      const title = prop(page, "Name") || "Untitled"
      let slug = slugify(prop(page, "Slug") || title) || page.id.replace(/-/g, "").slice(0, 8)
      if (collection !== "pages") {
        let s = slug
        for (let i = 2; usedSlugs.has(s); i++) s = `${slug}-${i}`
        slug = s
        usedSlugs.add(slug)
      }

      const isDetailCollection = config.detailCollections.includes(collection)
      const detailPage = isDetailCollection && !!prop(page, "Detail page")
      let summary = prop(page, "Summary") || ""
      let html = null

      const needsBody = collection === "pages" || detailPage || (isDetailCollection && !summary)
      if (needsBody) {
        const body = await toHtml(page.id)
        if (collection === "pages" || detailPage) html = body.html
        if (!summary && isDetailCollection) summary = excerpt(body.md)
      }

      const year = prop(page, "Year")
      entries.push({
        collection,
        notionId: page.id,
        title,
        slug,
        path: collection === "pages" ? (slug === "home" ? "/" : `/${slug}/`) : detailPage ? `/${collection}/${slug}/` : null,
        summary,
        description: prop(page, "Description") || summary || "",
        order: prop(page, "Order") ?? 9999,
        detailPage,
        cover: await fileUrl(page.cover),
        html,
        url: prop(page, "URL") || prop(page, "External link") || prop(page, "Link") || null,
        year: year == null ? null : String(year),
        tags: prop(page, "Tags") || [],
        semester: prop(page, "Semester"),
        code: prop(page, "Code"),
        level: prop(page, "Level"),
        years: prop(page, "Years"),
        authors: prop(page, "Authors"),
        venue: prop(page, "Venue"),
        pubType: prop(page, "Type"),
        lastEdited: page.last_edited_time,
      })
    }
  }
  return entries
}

async function loadEntries(reporter) {
  if (process.env.NOTION_FIXTURE) {
    reporter.warn(`[notion] Using fixture ${process.env.NOTION_FIXTURE} instead of the Notion API`)
    return JSON.parse(fs.readFileSync(process.env.NOTION_FIXTURE, "utf8"))
  }
  if (!process.env.NOTION_TOKEN) {
    throw new Error("[notion] NOTION_TOKEN is not set. Add it to .env (local) or to Netlify's environment variables.")
  }
  return loadFromNotion(reporter)
}

module.exports = { loadEntries, loadFromNotion, slugify, excerpt }
