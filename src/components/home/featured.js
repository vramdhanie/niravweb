import React from "react"
import styled from "styled-components"
const Featured = ({ className, children }) => {
  return (
    <section className={className}>
      <div className="centre">
        <div className="content">{children}</div>
      </div>
    </section>
  )
}

export default styled(Featured)`
  background: var(--mainWhite);
  height: 100vh;
  padding-top: 2rem;
  .centre {
    width: 90%;
    max-width: 800px;
    margin: 0 auto;
  }
`
