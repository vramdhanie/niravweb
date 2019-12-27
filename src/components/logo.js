import React from "react"
import styled from "styled-components"
import { useStaticQuery, graphql } from "gatsby"
import Img from "gatsby-image"

const Logo = ({ className }) => {
  const data = useStaticQuery(graphql`
    query {
      placeholderImage: file(relativePath: { eq: "logo_icon.png" }) {
        childImageSharp {
          fixed(width: 64) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)
  return (
    <div className={className}>
      <Img fixed={data.placeholderImage.childImageSharp.fixed} />
      <div className="text">
        <div className="main_Text">
          Nirav
          <span className="main_highlight">Draws</span>
        </div>
        <div className="sub_text">Drawings, Comics, Games</div>
      </div>
    </div>
  )
}

export default styled(Logo)`
  text-decoration: none !important;
  color: var(--primaryLight);
  font-weight: 400;
  font-size: 2rem;
  display: flex;

  .text {
    margin-left: 4px;
  }

  .sub_text {
    font-size: 1rem;
    font-weight: 300;
    text-align: right;
    text-decoration: none;
  }

  .main_highlight {
    color: var(--secondary);
  }
`
