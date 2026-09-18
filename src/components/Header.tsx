'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AlignRight } from 'lucide-react'
import links from '@/constants/links'
import social from '@/constants/social'

const LOGO_FADE =
  'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.82) 32%, rgba(255,255,255,0.4) 58%, rgba(255,255,255,0.1) 80%, transparent 100%)'

function DrawsLogo() {
  return (
    <div className="flex items-center text-[var(--primary-light)]">
      <Image src="/images/logo_icon.png" alt="Nirav Draws logo" width={64} height={59} priority />
      <div className="ml-1 leading-tight">
        <div className="text-3xl font-normal">
          Nirav<span className="text-[var(--secondary)]">Draws</span>
        </div>
        <div className="text-right text-base font-light">Physics, Mathematics, Drawings</div>
      </div>
    </div>
  )
}

function HomeWordmark() {
  return (
    <div className="leading-tight text-[var(--text-on-dark)]">
      <div className="font-logo text-xl font-normal sm:text-2xl">
        {/* jerk, snap, crackle, pop = 3rd–6th derivatives of position */}
        <span className="text-[0.6em] text-[var(--basin-blue-dark)]">jerk, </span>
        <span className="text-[var(--basin-blue)]">Snap</span>
        {', '}
        <span className="text-[var(--basin-green)]">Crackle</span>
        {' and '}
        <span className="text-[var(--basin-red)]">Pop</span>
      </div>
      <div className="text-right text-base font-light text-white/55">Here is all my stuff.</div>
    </div>
  )
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isDraws = pathname?.startsWith('/draws') ?? false

  return (
    <nav className={`relative bg-[var(--primary-dark)] ${isDraws ? 'sm:px-8' : ''}`}>
      {isDraws ? (
        <div className="mx-auto flex max-w-[1170px] flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/draws" className="no-underline">
              <DrawsLogo />
            </Link>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              className="cursor-pointer border-none bg-transparent text-[var(--text-on-dark)] lg:hidden"
            >
              <AlignRight size={24} />
            </button>
          </div>
          <NavLinks isOpen={isOpen} onNavigate={() => setIsOpen(false)} />
          <SocialIcons />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 items-stretch">
            <Link href="/" className="flex min-w-0 items-stretch no-underline">
              <span className="flex w-[7.75rem] shrink-0 items-center justify-center bg-white sm:w-[8.75rem]">
                <Image
                  src="/images/Logo/Niravweb Logo.png"
                  alt="Snap, Crackle and Pop logo"
                  width={76}
                  height={76}
                  className="object-contain"
                  priority
                />
              </span>
              <span
                aria-hidden
                className="w-[6.75rem] shrink-0 self-stretch sm:w-[8.5rem]"
                style={{ background: LOGO_FADE }}
              />
              <span className="flex items-center py-4 pr-3">
                <HomeWordmark />
              </span>
            </Link>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              className="ml-auto cursor-pointer border-none bg-transparent px-5 text-[var(--text-on-dark)] lg:hidden"
            >
              <AlignRight size={24} />
            </button>
          </div>
          <div className="flex min-w-0 flex-1 flex-col lg:flex-row lg:items-center lg:justify-end lg:pr-8">
            <NavLinks isOpen={isOpen} onNavigate={() => setIsOpen(false)} />
            <SocialIcons />
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLinks({ isOpen, onNavigate }: { isOpen: boolean; onNavigate: () => void }) {
  return (
    <ul
      className={`m-0 list-none overflow-hidden transition-all duration-300 lg:flex lg:h-auto lg:overflow-visible ${
        isOpen ? 'h-[112px]' : 'h-0'
      }`}
    >
      {links.map((item) => (
        <li key={item.path}>
          <Link
            href={item.path}
            onClick={onNavigate}
            className="block px-5 py-4 font-bold capitalize tracking-[var(--main-spacing)] text-[var(--text-on-dark)] no-underline transition-colors hover:text-[var(--secondary)]"
          >
            {item.text}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function SocialIcons() {
  return (
    <div className="hidden lg:flex lg:items-center">
      {social.map((item) => (
        <a
          key={item.label}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          className="mx-2 text-xl text-[var(--text-on-dark)] transition-transform hover:-translate-y-1 hover:text-[var(--secondary)]"
        >
          {item.icon}
        </a>
      ))}
    </div>
  )
}
