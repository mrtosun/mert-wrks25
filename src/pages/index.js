import React, { useEffect, useState } from "react"
import { graphql } from "gatsby"
import "../styles/global.css"  // import the global stylesheet

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
      {/* Title */}
      <h1>{title}</h1>

      {/* Content */}
      <div className="content" dangerouslySetInnerHTML={{ __html: html }} />

      {/* Links */}
      <div className="links">
        {/* <a href="/cv.pdf" download>Download my CV</a> "Bunu daha sonra ekleyeceğim" */} 
        <a href="https://www.linkedin.com/in/mert-tosun/" target="_blank" rel="noopener noreferrer">LinkedIn →</a>
        <a href="https://www.behance.net/merttosun#" target="_blank" rel="noopener noreferrer">Behance →</a>
        <a href="https://bsky.app/profile/tosunmert.bsky.social" target="_blank" rel="noopener noreferrer">Bluesky →</a>
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