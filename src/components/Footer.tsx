import Link from 'next/link'
import links from '@/constants/links'
import social from '@/constants/social'

export default function Footer() {
  return (
    <footer className="mt-auto bg-[var(--primary-dark)] px-8 py-8 text-center text-[var(--text-on-dark)]">
      <div>
        {links.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="mx-4 my-2 inline-block text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--main-white)] no-underline transition-colors hover:text-[var(--secondary)]"
          >
            {item.text}
          </Link>
        ))}
      </div>

      <div className="my-2">
        {social.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="mx-4 inline-block text-xl text-[var(--main-white)] transition-colors hover:text-[var(--secondary)]"
          >
            {item.icon}
          </a>
        ))}
      </div>

      <div className="mt-4 flex justify-between text-[0.6rem] text-[var(--main-white)]">
        <div>© {new Date().getFullYear()} Vincent Ramdhanie</div>
        <div>
          Built with{' '}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--secondary)] no-underline hover:underline"
          >
            Next.js
          </a>{' '}
          by{' '}
          <a
            href="https://vincentramdhanie.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--secondary)] no-underline hover:underline"
          >
            Vincent
          </a>
        </div>
      </div>
    </footer>
  )
}
