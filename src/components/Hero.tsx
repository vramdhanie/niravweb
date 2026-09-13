import type { ReactNode } from 'react'

interface HeroProps {
  img: string
  home?: boolean
  children?: ReactNode
}

export default function Hero({ img, home = false, children }: HeroProps) {
  const overlay = home
    ? 'linear-gradient(var(--home-start), var(--home-end))'
    : 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45))'

  return (
    <header
      className="flex flex-col items-center justify-around gap-8 bg-cover bg-center px-4 md:flex-row"
      style={{
        backgroundImage: `${overlay}, url(${img})`,
        minHeight: home ? 'calc(100vh - 96px)' : '50vh',
      }}
    >
      {children}
    </header>
  )
}
