import React from "react"
import styled from "styled-components"
import Image from "gatsby-image"
import { Link } from "gatsby"
import { FaCircle } from 'react-icons/fa'

const ArticleCard = ({ className, article, excerpt }) => {
  const { title, date, author, slug } = article
  const img = article.image.childImageSharp.fluid
  return (
    <article className={className}>
      <div className="image">
        <Image fluid={img} />
      </div>
      <div className="info">
        <div>
          <h2>{title}</h2>
          <h6>
            <span>by {author}</span> <FaCircle className="dot" /> <span>{date}</span>
          </h6>
          <p>{excerpt}</p>
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
  .info {
    padding: 1rem 0;
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
    display: grid;
    grid-template-columns: 350px 1fr;

    .info {
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
    }
    .image > div {
      height: 250px;
    }
  }
`
