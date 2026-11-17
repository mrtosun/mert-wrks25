const path = require("path")
require("dotenv").config({ path: ".env" })
const { loadEntries } = require("./src/notion/fetch")
const config = require("./notion.config")

exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type NotionEntry implements Node @dontInfer {
      collection: String!
      notionId: String!
      title: String
      slug: String
      path: String
      summary: String
      description: String
      order: Float
      detailPage: Boolean
      cover: String
      html: String
      url: String
      year: String
      tags: [String]
      semester: String
      code: String
      level: String
      years: String
      authors: String
      venue: String
      pubType: String
      lastEdited: Date @dateformat
    }
  `)
}

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest, reporter }) => {
  const entries = await loadEntries(reporter)
  for (const entry of entries) {
    actions.createNode({
      ...entry,
      id: createNodeId(`notion-${entry.collection}-${entry.notionId}`),
      internal: { type: "NotionEntry", contentDigest: createContentDigest(entry) },
    })
  }
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { data, errors } = await graphql(`
    {
      allNotionEntry {
        nodes { id collection slug path detailPage }
      }
    }
  `)
  if (errors) return reporter.panicOnBuild("[notion] GraphQL error in createPages", errors)

  const nodes = data.allNotionEntry.nodes
  if (!nodes.some(n => n.collection === "pages" && n.slug === "home")) {
    reporter.panicOnBuild('[notion] No published Site Pages row with Slug "home". The home page needs it.')
  }

  const liveSections = new Set(
    nodes.filter(n => n.collection === "pages" && config.sections.includes(n.slug)).map(n => n.slug)
  )

  for (const n of nodes) {
    if (n.collection === "pages" && liveSections.has(n.slug)) {
      actions.createPage({
        path: n.path,
        component: path.resolve("src/templates/section.js"),
        context: { id: n.id, section: n.slug },
      })
    }
    if (n.detailPage && n.path && liveSections.has(n.collection)) {
      actions.createPage({
        path: n.path,
        component: path.resolve("src/templates/entry.js"),
        context: { id: n.id, section: n.collection },
      })
    }
  }
}
