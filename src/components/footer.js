import React from "react"
import styled from "styled-components"
import social from "../constants/social"
import links from "../constants/links"
import AniLink from "gatsby-plugin-transition-link/AniLink"

const Footer = ({ className }) => {
  return (
    <footer className={className}>
      <div className="links">
        {links.map((item, index) => (
          <AniLink fade to={item.path} key={index}>
            {item.text}
          </AniLink>
        ))}
      </div>
      <div className="icons">
        {social.map((item, index) => (
          <a
            href={item.url}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.icon}
          </a>
        ))}
      </div>
      <section className="faded">
        <div>© {new Date().getFullYear()} Vincent Ramdhanie</div>
        <div>
          Built with
          <span className="gatsby attribution">
            <a href="https://www.gatsbyjs.org">Gatsby</a>
          </span>
          by
          <span className="vincent attribution">
            <a href="https://vincentramdhanie.com">Vincent</a>
          </span>
        </div>
      </section>
    </footer>
  )
}

export default styled(Footer)`
  background-color: var(--primaryDark);
  color: var(--primaryText);

  margin-top: auto;
  padding: 2rem;
  text-align: center;

  .links a {
    display: inline-block;
    text-decoration: none;
    text-transform: uppercase;
    color: var(--primaryLight);
    margin: 0.5rem 1rem;
    letter-spacing: var(--mainSpacing);
    transition: var(--mainTransition);
    font-weight: bold;
    font-size: 0.8rem;
  }
  .links a:hover {
    color: var(--primary);
  }
  .icons a {
    display: inline-block;
    margin: 1rem;
    font-size: 1.2rem;
    color: var(--primaryLight);
    transition: var(--mainTransition);
  }
  .icons a:hover {
    color: var(--primary);
  }
  .copyright {
    text-transform: capitalize;
    letter-spacing: var(--mainSpacing);
    line-height: 2;
  }

  .attribution {
    font-size: 0.5em;
    margin-top: 5px;
  }

  .attribution a {
    display: inline-block;
    font-size: 0.7rem;
    color: var(--primaryLight);
    transition: var(--mainTransition);
    margin: 0 3px;
    text-decoration: none;
  }

  .attribution a:hover {
    color: var(--primary);
  }

  .faded {
    font-size: 0.5rem;
    display: flex;
    justify-content: space-between;
  }
`
