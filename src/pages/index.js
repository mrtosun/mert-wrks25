import React from "react"
import { graphql } from "gatsby"
import "../styles/global.css"
import SEO from "../components/seo"
import { sections } from "../../notion.config"

const HomePage = ({ data }) => {
  const home = data.home
  const pages = data.pages.nodes
  const sectionLinks = sections.map(s => pages.find(p => p.slug === s)).filter(Boolean)

  return (
    <main className="container">
      <SEO title="Home | Mert Tosun's Work" description={home.description} pathname="/" />
      <div className="blue-circle"></div>
      <h1>{home.title}</h1>
      <div className="content" dangerouslySetInnerHTML={{ __html: home.html }} />

      <div className="links">
        {sectionLinks.map(p => (
          <a key={p.slug} href={p.path}>{p.title} →</a>
        ))}
        {data.links.nodes.map(l => (
          <a key={l.notionId} href={l.url} target="_blank" rel="noopener noreferrer">{l.title} →</a>
        ))}
      </div>

      <footer>
        <p>© Mert Tosun {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}

export default HomePage

export const pageQuery = graphql`
  query {
    home: notionEntry(collection: { eq: "pages" }, slug: { eq: "home" }) {
      title
      html
      description
    }
    pages: allNotionEntry(filter: { collection: { eq: "pages" } }) {
      nodes { slug title path }
    }
    links: allNotionEntry(
      filter: { collection: { eq: "links" } }
      sort: [{ order: ASC }, { title: ASC }]
    ) {
      nodes { notionId title url }
    }
  }
`
