import React from "react"
import ArticleCard from "./articleCard"
import styled from "styled-components"

const ArticleList = ({ className, articles }) => {
  return (
    <div className={className}>
      <div className="center">
        {articles.map(({ node }, index) => (
          <ArticleCard
            article={node.frontmatter}
            excerpt={node.excerpt}
            key={index}
          />
        ))}
      </div>
    </div>
  )
}

export default styled(ArticleList)`
  padding: 4rem 0;

  h1 {
    text-align: center;
    letter-spacing: 5px;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
    font-size: 48px;
  }
  h4 {
    letter-spacing: 5px;
    text-transform: capitalize;
    font-size: 14px;
    text-align: center;
    margin-bottom: 3rem;
  }
  .center {
    width: 85vw;
    margin: 0 auto;
    max-width: 750px;
  }
`
