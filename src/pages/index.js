import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Hero from "../components/hero"
import Banner from "../components/banner"
import Featured from "../components/home/featured"
import Title from "../components/title"
import AniLink from "gatsby-plugin-transition-link/AniLink"
import { graphql } from "gatsby"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />
    <Hero home="true" img={data.homeBg.childImageSharp.fluid}>
      <Banner
        title="Gatsby Starter Vincent"
        info="Based on Gatsby Default Starter"
      >
        <AniLink fade to="/articles" className="btn-white">
          explore articles
        </AniLink>
      </Banner>
    </Hero>
    <Featured title="Featured Items">
      <Title title="Featured" subtitle="Items" />
      We can place anything here
    </Featured>
  </Layout>
)

export default IndexPage

export const query = graphql`
  query {
    homeBg: file(relativePath: { eq: "home_bg.jpg" }) {
      childImageSharp {
        fluid(quality: 90, maxWidth: 4160) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
