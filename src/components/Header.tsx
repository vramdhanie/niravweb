'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlignRight } from 'lucide-react'
import links from '@/constants/links'
import social from '@/constants/social'

function Logo() {
  return (
    <div className="flex items-center text-[var(--primary-light)]">
      <Image src="/images/logo_icon.png" alt="Nirav Draws logo" width={64} height={59} priority />
      <div className="ml-1 leading-tight">
        <div className="text-3xl font-normal">
          Nirav<span className="text-[var(--secondary)]">Draws</span>
        </div>
        <div className="text-right text-base font-light">Drawings, Comics, Games</div>
      </div>
    </div>
  )
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-[var(--primary-dark)] sm:px-8">
      <div className="mx-auto flex max-w-[1170px] flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* header row: logo + hamburger */}
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/" className="no-underline">
            <Logo />
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

        {/* nav links */}
        <ul
          className={`m-0 list-none overflow-hidden transition-all duration-300 lg:flex lg:h-auto lg:overflow-visible ${
            isOpen ? 'h-[112px]' : 'h-0'
          }`}
        >
          {links.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-5 py-4 font-bold capitalize tracking-[var(--main-spacing)] text-[var(--text-on-dark)] no-underline transition-colors hover:text-[var(--secondary)]"
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>

        {/* social icons (desktop) */}
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
      </div>
    </nav>
  )
}
