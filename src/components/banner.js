import React from "react"
import styled from "styled-components"

const Banner = ({ className, title, info, children }) => {
  return (
    <div className={className}>
      <h1>{title}</h1>
      <p>{info}</p>
      {children}
    </div>
  )
}

export default styled(Banner)`
  text-align: center;
  letter-spacing: var(--mainSpacing);
  color: var(--primaryText);
  text-shadow: 0 0 2px black;

  h1 {
    font-size: 3.3rem;
    text-transform: uppercase;
    margin-bottom: 2rem;
    padding: 0 1rem;
    letter-spacing: 6px;
  }
  p {
    width: 85%;
    margin: 0 auto;
    margin-bottom: 2rem;
  }
  @media screen and (min-width: var(--tablet)) {
    h1 {
      font-size: 4.5rem;
    }
    p {
      width: 70%;
    }
  }
`
