import katex from 'katex'

// Server components: KaTeX renders to static HTML at build time.

export function MathBlock({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: false })
  return (
    <div
      className="my-5 overflow-x-auto text-[var(--primary-dark)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function MathInline({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { displayMode: false, throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
