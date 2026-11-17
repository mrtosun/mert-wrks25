import React from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"

const Meta = ({ item }) => {
  const bits = [item.code, item.semester, item.year, item.years, item.level].filter(Boolean)
  return bits.length ? <p className="meta">{bits.join(" · ")}</p> : null
}

// Wraps a card in a link when the entry has its own page or an external link
const MaybeLink = ({ item, children, className }) => {
  if (item.detailPage && item.path) return <Link to={item.path} className={className}>{children}</Link>
  if (item.url) return <a href={item.url} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  return <div className={className}>{children}</div>
}

const Cards = ({ items }) => (
  <div className="cards">
    {items.map(item => (
      <MaybeLink key={item.notionId} item={item} className="card">
        {item.cover && <img src={item.cover} alt="" loading="lazy" />}
        <h2>{item.title}</h2>
        <Meta item={item} />
        {item.summary && <p>{item.summary}</p>}
        {item.tags?.length > 0 && <p className="tags">{item.tags.join(", ")}</p>}
      </MaybeLink>
    ))}
  </div>
)

const TeachingList = ({ items }) => (
  <div className="rows">
    {items.map(item => (
      <MaybeLink key={item.notionId} item={item} className="row">
        <h2>{item.code && item.code !== item.title ? `${item.code} · ${item.title}` : item.title}</h2>
        <p className="meta">{[item.level, item.years].filter(Boolean).join(" · ")}</p>
        {item.summary && <p>{item.summary}</p>}
      </MaybeLink>
    ))}
  </div>
)

const PublicationList = ({ items }) => {
  const sorted = [...items].sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0) || a.title.localeCompare(b.title))
  return (
    <ol className="publications">
      {sorted.map(p => (
        <li key={p.notionId}>
          {p.authors && <span>{p.authors} </span>}
          {p.year && <span>({p.year}). </span>}
          {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer">{p.title}</a> : <strong>{p.title}</strong>}
          {p.venue && <span>. <em>{p.venue}</em></span>}
          {p.pubType && <span className="meta"> · {p.pubType}</span>}
        </li>
      ))}
    </ol>
  )
}

const SectionPage = ({ data, pageContext }) => {
  const { page, items } = data
  const list = items.nodes
  let body
  if (pageContext.section === "publications") body = <PublicationList items={list} />
  else if (pageContext.section === "teaching") body = <TeachingList items={list} />
  else body = <Cards items={list} />

  return (
    <Layout current={pageContext.section}>
      <SEO title={`${page.title} | Mert Tosun`} description={page.description} pathname={page.path} />
      <h1>{page.title}</h1>
      {page.html && <div className="intro" dangerouslySetInnerHTML={{ __html: page.html }} />}
      {list.length ? body : <p className="meta">Nothing here yet.</p>}
    </Layout>
  )
}

export default SectionPage

export const query = graphql`
  query ($id: String!, $section: String!) {
    page: notionEntry(id: { eq: $id }) {
      title
      html
      description
      path
    }
    items: allNotionEntry(
      filter: { collection: { eq: $section } }
      sort: [{ order: ASC }, { title: ASC }]
    ) {
      nodes {
        notionId title path detailPage summary cover url
        year tags semester code level years authors venue pubType
      }
    }
  }
`
