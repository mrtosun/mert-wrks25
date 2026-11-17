import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"

const EntryPage = ({ data, pageContext }) => {
  const { entry, section } = data
  const meta = [entry.code, entry.semester, entry.year, entry.years, entry.level].filter(Boolean)

  return (
    <Layout current={pageContext.section}>
      <SEO title={`${entry.title} | Mert Tosun`} description={entry.summary} pathname={entry.path}>
        {entry.cover && <meta name="og:image" content={entry.cover} />}
      </SEO>
      {section && <Link to={section.path} className="back">← {section.title}</Link>}
      <h1>{entry.title}</h1>
      {meta.length > 0 && <p className="meta">{meta.join(" · ")}</p>}
      {entry.cover && <img className="cover" src={entry.cover} alt="" />}
      <article className="article" dangerouslySetInnerHTML={{ __html: entry.html }} />
      {entry.url && (
        <p className="links">
          <a href={entry.url} target="_blank" rel="noopener noreferrer">Visit project →</a>
        </p>
      )}
    </Layout>
  )
}

export default EntryPage

export const query = graphql`
  query ($id: String!, $section: String!) {
    entry: notionEntry(id: { eq: $id }) {
      title path summary cover html url
      year semester code level years
    }
    section: notionEntry(collection: { eq: "pages" }, slug: { eq: $section }) {
      title
      path
    }
  }
`
