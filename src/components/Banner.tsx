import type { ReactNode } from 'react'

interface BannerProps {
  title?: string
  info?: string
  children?: ReactNode
}

export default function Banner({ title, info, children }: BannerProps) {
  return (
    <div
      className="text-center tracking-[var(--main-spacing)] text-[var(--text-on-dark)]"
      style={{ textShadow: '0 0 2px black' }}
    >
      {title && (
        <h1 className="mb-8 px-4 text-5xl font-bold uppercase tracking-[6px] md:text-7xl">
          {title}
        </h1>
      )}
      {info && <p className="mx-auto mb-8 w-[85%] md:w-[70%]">{info}</p>}
      {children}
    </div>
  )
}
