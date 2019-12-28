import React from "react"
import styled from "styled-components"
import Image from "gatsby-image"
import { Link } from "gatsby"

const ArticleCard = ({ className, article, excerpt }) => {
  const { title, date, slug } = article
  const img = article.thumb.childImageSharp.fluid
  return (
    <article className={className}>
      <div className="image">
        <Image fluid={img} />
      </div>
      <div className="info">
        <div>
          <h2>{title}</h2>
          <h6>
            <span>{date}</span>
          </h6>
          <Link to={slug} className="link">
            read more
          </Link>
        </div>
      </div>
    </article>
  )
}

export default styled(ArticleCard)`
  margin-bottom: 2rem;
  background: #ffffff;
  padding: 1rem;
  text-align: center;

  position: relative;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  cursor: pointer;

  .info {
    padding: 1rem 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.5);
  }
  .info h2 {
    font-size: 30px;
    text-transform: capitalize;
    margin-bottom: 10px;
  }
  .info h6 {
    color: var(--primaryLight);
    text-transform: capitalize;
  }
  .info p {
    padding: 20px 0 30px 0;
    text-align: left;
  }
  .link {
    border: 1px solid var(--primaryDark);
    padding: 4px 8px;
    display: inline-block;
    color: var(--primaryDark);
    text-decoration: none;
    text-transform: capitalize;
    transition: all 0.3s ease-in-out;
  }
  .link:hover {
    background: var(--primaryDark);
    color: #ffffff;
  }
  .dot {
    opacity: 0.5;
    font-size: 0.6rem;
  }
  @media (min-width: 776px) {
    .image > div {
      height: 250px;
    }
  }
`
