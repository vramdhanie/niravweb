import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Hero from '@/components/Hero'
import Banner from '@/components/Banner'
import { getAllDrawings, getDrawing } from '@/lib/drawings'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export function generateStaticParams() {
  return getAllDrawings().map((d) => ({ slug: d.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const drawing = getDrawing(slug)
  if (!drawing) return {}
  return {
    title: drawing.title,
    description: `${drawing.title} — a drawing by ${drawing.author}.`,
  }
}

export default async function DrawingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const drawing = getDrawing(slug)
  if (!drawing) notFound()

  return (
    <>
      <Hero img={drawing.image}>
        <Banner title={drawing.title}>
          <p className="text-[var(--text-on-dark)]">{formatDate(drawing.date)}</p>
        </Banner>
      </Hero>

      <article className="mx-auto w-[90vw] max-w-[750px] py-16">
        <div className="drawing-content">
          <MDXRemote source={drawing.content} />
        </div>

        <Link
          href="/draws/drawings"
          className="mt-10 inline-flex items-center gap-2 border border-[var(--primary-dark)] px-3 py-1.5 capitalize text-[var(--primary-dark)] no-underline transition-all duration-300 hover:bg-[var(--primary-dark)] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to all Drawings
        </Link>
      </article>
    </>
  )
}
