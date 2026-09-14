import Link from 'next/link'
import Image from 'next/image'
import type { Drawing } from '@/lib/drawings'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function DrawingCard({ drawing }: { drawing: Drawing }) {
  return (
    <article className="relative cursor-pointer rounded-lg bg-white p-4 text-center shadow-[0_0_2px_2px_rgba(0,0,0,0.2)]">
      <div className="relative h-[250px] w-full overflow-hidden rounded">
        <Image
          src={drawing.thumb}
          alt={drawing.title}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="pt-4">
        <h2 className="mb-2 text-2xl font-normal capitalize">{drawing.title}</h2>
        <h6 className="mb-3 text-sm capitalize text-[var(--primary-light)]">
          {formatDate(drawing.date)}
        </h6>
        <Link
          href={`/draws/drawings/${drawing.slug}`}
          className="inline-block border border-[var(--primary-dark)] px-2 py-1 capitalize text-[var(--primary-dark)] no-underline transition-all duration-300 hover:bg-[var(--primary-dark)] hover:text-white"
        >
          read more
        </Link>
      </div>
    </article>
  )
}
