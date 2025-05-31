import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import "../styles/global.css"  // import the global stylesheet;
import SEO from "../components/seo"

const HomePage = ({ data }) => {
  const pageData = data.allMarkdownRemark.edges[0]?.node
  const { title } = pageData.frontmatter
  const { html } = pageData

  // State to hold the current year
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Ensure the year updates if the component mounts
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <main className="container">
        <SEO
        title="Home | Mert Tosun's Work"
        description="I'm working at the intersection of design and research"
      />
      {/* Blue Circle */}
      <div className="blue-circle"></div>

      {/* Title */}
      <h1>{title}</h1>

      {/* Content */}
      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />

      {/* Links */}
      <div className="links">
        <a href="/2025-02-28 CV - Mert Tosun.pdf" target="_blank" rel="noopener noreferrer"> Curriculum Vitae →  </a>
        <a href="https://www.notion.so/mert-tosun/18c8b29ff8a88043b693d2fde004b941?v=1988b29ff8a880a5bf76000c70050c5f" target="_blank" rel="noopener noreferrer">  Studio projects → </a>
        <a href="https://www.linkedin.com/in/mert-tosun/" target="_blank" rel="noopener noreferrer"> Connect on LinkedIn →</a>
        <a href="https://www.behance.net/merttosun#" target="_blank" rel="noopener noreferrer">Projects on Behance →</a>
        <a href="https://www.instagram.com/mert_works/" target="_blank" rel="noopener noreferrer">Works on Instagram →</a>
      </div>

      {/* Footnote */}
      <footer>
        <p>© Mert Tosun {currentYear}</p>
      </footer>
    </main>
  )
}

export default HomePage

// GraphQL query to get the Markdown content
export const pageQuery = graphql`
  query {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
          }
          html
        }
      }
    }
  }
`