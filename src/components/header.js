import AniLink from "gatsby-plugin-transition-link/AniLink"
import PropTypes from "prop-types"
import React, { useState } from "react"

import styled from "styled-components"

import { FaAlignRight } from "react-icons/fa"
import links from "../constants/links"
import social from "../constants/social"
import Logo from "./logo"

const Header = ({ className, siteTitle }) => {
  const [isOpen, setNav] = useState(false)
  const toggleNav = () => {
    setNav(isOpen => !isOpen)
  }
  return (
    <nav className={className}>
      <div className="nav-center">
        <div className="nav-header">
          <AniLink fade to="/">
            <Logo />
          </AniLink>
          <button type="button" className="logo-btn" onClick={toggleNav}>
            <FaAlignRight className="logo-icon" />
          </button>
        </div>
        <ul className={isOpen ? `nav-links show-nav` : `nav-links`}>
          {links.map((item, index) => {
            return (
              <li key={index}>
                <AniLink fade to={item.path}>
                  {item.text}
                </AniLink>
              </li>
            )
          })}
        </ul>
        <div className="nav-social-links">
          {social.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default styled(Header)`
  background: var(--primaryDark);

  .nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
  }

  .nav-header a {
    text-decoration: none;
  }

  .logo-btn {
    background: transparent;
    border: none;
    outline: none;
  }
  .logo-btn:hover {
    cursor: pointer;
  }
  .logo-icon {
    color: var(--primaryText);
    font-size: 1.5rem;
  }

  .nav-links {
    list-style-type: none;
    transition: var(--mainTransition);
    height: 0;
    overflow: hidden;
    margin: 0;
  }
  .show-nav {
    height: 216px;
  }
  .nav-links a {
    display: block;
    padding: 1rem 1.25rem;
    text-decoration: none;
    text-transform: capitalize;
    color: var(--primaryText);
    transition: var(--mainTransition);
    font-weight: bold;
    letter-spacing: var(--mainSpacing);
  }
  .nav-links a:hover {
    color: var(--primary);
  }
  .nav-social-links {
    display: none;
  }
  @media screen and (min-width: 576px) {
    padding: 0 2rem;
  }

  @media screen and (min-width: 992px) {
    .logo-btn {
      display: none;
    }
    .nav-center {
      max-width: 1170px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-links {
      height: auto;
      display: flex;
    }
    .nav-social-links {
      display: flex;
      line-height: 0;
    }
    .nav-social-links a {
      color: var(--primaryText);
      margin: 0 0.5rem;
      font-size: 1.2rem;
      transition: var(--mainTransition);
    }
    .nav-social-links a:hover {
      color: var(--primary);
      transform: translateY(-5px);
    }
  }
`
