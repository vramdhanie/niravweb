import React from "react"
import styled from "styled-components"

const Title = ({ title, subtitle, className }) => {
  return (
    <div className={className}>
      <h4>
        <span className="title">{title}</span>
        <span>{subtitle}</span>
      </h4>
    </div>
  )
}

export default styled(Title)`
  text-transform: uppercase;
  font-size: 2.2rem;
  margin-bottom: 2rem;
  h4 {
    text-align: center;
    letter-spacing: 6px;
    color: var(--primary);
  }
  .title {
    color: var(--primaryDark);
    margin-right: 5px;
  }
`
