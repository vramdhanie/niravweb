import Link from 'next/link'
import Image from 'next/image'
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

      <div className="mt-4 flex flex-wrap items-start justify-between gap-2 text-[0.6rem] text-[var(--main-white)]">
        <div className="min-w-0 flex-1 pr-4">
          © {new Date().getFullYear()} Nirav Ramdhanie{' '}
          <span className="text-white/40">
            · 3rd, 4th, 5th, 6th derivatives of position with respect to time are jerk, snap,
            crackle and pop respectively.
          </span>
        </div>
        <a
          href="https://vincentramdhanie.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Vincent Ramdhanie"
          className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
        >
          <Image src="/images/vr-logo.png" alt="Vincent Ramdhanie" width={18} height={18} />
        </a>
      </div>
    </footer>
  )
}
