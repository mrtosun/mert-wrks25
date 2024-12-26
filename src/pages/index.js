import React from "react"
import { graphql } from "gatsby"
import "../styles/global.css"  // import the global stylesheet

const HomePage = ({ data }) => {
  // The query will pass data into this component as props
  const pageData = data.allMarkdownRemark.edges[0].node
  const { title } = pageData.frontmatter
  const { html } = pageData

  return (
    <main className="container">
      <h1>Welcome to My Site</h1>
      <p>
        This is a simplified, contemporary layout using the “container” approach
        for margins. Inter font is applied globally, and the site is responsive.
      </p>
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
