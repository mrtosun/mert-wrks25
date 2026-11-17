import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"
import "../styles/global.css"
import { sections } from "../../notion.config"

// Shared shell for inner pages: logo dot + section navigation + footer
const Layout = ({ children, current }) => {
  const data = useStaticQuery(graphql`
    query {
      allNotionEntry(filter: { collection: { eq: "pages" } }) {
        nodes { slug title path }
      }
    }
  `)
  const nav = sections
    .map(s => data.allNotionEntry.nodes.find(n => n.slug === s))
    .filter(Boolean)

  return (
    <main className="container">
      <header className="site-header">
        <Link to="/" className="blue-circle" aria-label="Home" />
        <nav className="site-nav">
          {nav.map(n => (
            <Link key={n.slug} to={n.path} className={current === n.slug ? "active" : undefined}>
              {n.title}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer>
        <p>© Mert Tosun {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}

export default Layout
