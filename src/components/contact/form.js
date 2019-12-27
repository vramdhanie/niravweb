import React from "react"
import Title from "../title"
import styled from "styled-components"

const Form = ({ className }) => {
  return (
    <section className={className}>
      <Title title="Email" subtitle="Me" />
      <div className="center">
        <form
          className="form"
          action="https://formspree.io/your@email.com"
          method="POST"
        >
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              name="name"
              id="name"
              className="formControl"
              placeholder="Full name"
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className="formControl"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              rows="10"
              className="formControl"
              placeholder="Hi!"
            />
          </div>
          <div>
            <input type="submit" value="Send" className="submit" />
          </div>
        </form>
      </div>
    </section>
  )
}

export default styled(Form)`
  padding: 4rem 0;
  .center {
    width: 80vw;
    margin: 0 auto;
  }
  @media screen and (min-width: 992px) {
    .center {
      width: 50vw;
      margin: 0 auto;
    }
  }
  .contact label {
    text-transform: capitalize;
    display: block;
    margin-bottom: 0.5rem;
  }
  .formControl,
  .submit {
    width: 100%;
    font-size: 1rem;
    margin-bottom: 1rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--primaryDark);
    border-radius: 0.25rem;
  }
  .submit {
    background-color: var(--primary);
    border-color: var(--primary);
    text-transform: uppercase;
    color: var(--primaryText);
    transition: var(--mainTransition);
    cursor: pointer;
  }
  .submit:hover {
    background: var(--primaryDark);
    color: var(--mainWhite);
    border-color: var(--primaryDark);
  }
`
