import React, { useEffect, useState } from "react"
import { graphql, Link } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import "../styles/global.css"
import SEO from "../components/seo"

const ProjectsPage = ({ data }) => {
  const allProjects = data.allMarkdownRemark.edges
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [activeTag, setActiveTag] = useState(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const allTags = [...new Set(allProjects.flatMap(({ node }) => node.frontmatter.tags || []))]

  const visibleProjects = activeTag
    ? allProjects.filter(({ node }) => (node.frontmatter.tags || []).includes(activeTag))
    : allProjects

  const handleTagClick = (tag) => {
    setActiveTag(prev => (prev === tag ? null : tag))
  }

  return (
    <main className="container">
      <SEO
        title="Projects | Mert Tosun's Work"
        description="Selected projects by Mert Tosun"
      />
      <div className="blue-circle"></div>
      <h1>Projects</h1>

      <div className="tag-filter-bar">
        <button
          className={`tag-chip${activeTag === null ? " active" : ""}`}
          onClick={() => setActiveTag(null)}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`tag-chip${activeTag === tag ? " active" : ""}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="projects-list">
        {visibleProjects.map(({ node }) => {
          const { title, summary, image, tags, link } = node.frontmatter
          const img = image ? getImage(image) : null
          return (
            <div key={title} className="project-card">
              {img && (
                <div className="project-card-image">
                  <GatsbyImage image={img} alt={title} />
                </div>
              )}
              <div className="project-card-content">
                <h2>{title}</h2>
                <p className="project-summary">{summary}</p>
                {tags && tags.length > 0 && (
                  <div className="project-tags">
                    {tags.map(tag => (
                      <span key={tag} className="project-tag">{tag}</span>
                    ))}
                  </div>
                )}
                {link && (
                  <a
                    href={link}
                    className="project-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    more about this project →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="links" style={{ marginTop: "4em" }}>
        <Link to="/">← Back</Link>
      </div>

      <footer>
        <p>© Mert Tosun {currentYear}</p>
      </footer>
    </main>
  )
}

export default ProjectsPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: "/src/content/projects/" } }
      sort: { frontmatter: { date: DESC } }
      limit: 7
    ) {
      edges {
        node {
          frontmatter {
            title
            summary
            date
            tags
            link
            image {
              childImageSharp {
                gatsbyImageData(
                  width: 300
                  height: 300
                  layout: CONSTRAINED
                  transformOptions: { cropFocus: CENTER, fit: COVER }
                )
              }
            }
          }
        }
      }
    }
  }
`
