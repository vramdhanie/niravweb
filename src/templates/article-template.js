import React from "react"
import styled from "styled-components"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import Hero from "../components/hero"
import Banner from "../components/banner"
import { MDXRenderer } from "gatsby-plugin-mdx"

const ArticleTemplate = ({ data, className }) => {
  const { title, date, author, image } = data.mdx.frontmatter
  const { body } = data.mdx
  const img = image.childImageSharp.fluid

  return (
    <Layout>
      <Hero img={img}>
        <Banner title={title} info={author}>
          {date}
        </Banner>
      </Hero>
      <section className={className}>
        <Link className="link" to="/articles">
          Back to all Articles
        </Link>
        <div className="content">
          <MDXRenderer>{body}</MDXRenderer>
        </div>
      </section>
    </Layout>
  )
}

export const query = graphql`
  query getArticle($slug: String!) {
    mdx(frontmatter: { slug: { eq: $slug } }) {
      frontmatter {
        title
        slug
        date(formatString: "D MMMM YYYY")
        author
        image {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
      body
    }
  }
`

export default styled(ArticleTemplate)`
  width: 80vw;
  margin: 4rem auto;
  max-width: 750px;
  padding: 2rem;
  background: var(--mainWhite);

  .link {
    border: 1px solid var(--mainBlack);
    padding: 4px 8px;
    display: inline-block;
    color: var(--mainBlack);
    text-decoration: none;
    text-transform: capitalize;
    transition: all 0.3s ease-in-out;
    margin-bottom: 2rem;
  }
  .link:hover {
    background: var(--mainBlack);
    color: var(--mainWhite);
  }
  .info {
    text-align: center;
  }
  .info h1 {
    letter-spacing: 5px;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
    font-size: 48px;
    color: var(--primaryDark);
  }
  .info h4 {
    letter-spacing: 5px;
    text-transform: capitalize;
    font-size: 0.7rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--primaryLight);
  }
  .content {
    margin: 2rem 0;
  }
  .content h2 {
    text-transform: capitalize;
    margin-bottom: 1rem;
    color: var(--primaryDark);
  }
  .content p {
    line-height: 1.5;
    margin-bottom: 1rem;
  }
  .articleImage span {
    display: block;
    max-width: 100% !important;
    margin: 2rem;
  }
  .dot {
    opacity: 0.5;
    font-size: 0.6rem;
  }
`
