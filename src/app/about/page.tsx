import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About me',
  description: 'About Nirav Ramdhanie.',
}

export default function AboutPage() {
  return (
    <div className="px-4 py-10 md:py-14">
      <div className="mx-auto flex min-h-[50vh] max-w-[760px] flex-col">
        <p className="flex flex-1 items-center justify-center text-center text-lg text-[var(--primary)]">
          Talk about me here
        </p>

        <div className="mt-12 border-t border-[color:rgba(0,0,0,0.1)] pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
