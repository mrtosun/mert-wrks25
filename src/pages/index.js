import React from "react"
import { graphql } from "gatsby"

const HomePage = ({ data }) => {
  // The query will pass data into this component as props
  const pageData = data.allMarkdownRemark.edges[0].node
  const { title } = pageData.frontmatter
  const { html } = pageData

  return (
    <main style={{ margin: `0 auto`, maxWidth: 600, padding: `1rem` }}>
      {/* Display the title from frontmatter */}
      <h1>{title}</h1>
      
      {/* Display the HTML content from the Markdown file */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
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
