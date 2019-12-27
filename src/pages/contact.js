import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Banner from "../components/banner"
import { graphql } from "gatsby"
import Hero from "../components/hero"
import Form from "../components/contact/form"

const Contact = ({ data }) => (
  <Layout>
    <SEO title="Contact" />
    <Hero img={data.contactBg.childImageSharp.fluid}>
      <Banner>
        <h1>Contact Page</h1>
      </Banner>
    </Hero>
    <Form />
  </Layout>
)

export default Contact

export const query = graphql`
  query {
    contactBg: file(relativePath: { eq: "contact_bg.jpg" }) {
      childImageSharp {
        fluid(quality: 90, maxWidth: 4160) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
