'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import AsteroidField from '@/components/home/AsteroidField'
import FeaturedHero from '@/components/home/FeaturedHero'
import GrowingArrow from '@/components/home/GrowingArrow'
import { boxCentre, ellipseAround, generateChaoticPath, randomPerpFromEllipse, type Box, type Ellipse } from '@/lib/chaoticPath'

interface Trail {
  id: number
  d: string
  duration: number
  stem?: boolean
}

interface HeroDecor {
  ellipse: Ellipse
}

function localBox(el: Element, wrap: DOMRect): Box {
  const r = el.getBoundingClientRect()
  return {
    x: r.left - wrap.left,
    y: r.top - wrap.top,
    width: r.width,
    height: r.height,
  }
}

interface Props {
  title: string
  eyebrow: string
  repo: string
  author: string
}

export default function HomeFeatured({ title, eyebrow, repo, author }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLAnchorElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLParagraphElement>(null)
  const readRef = useRef<HTMLButtonElement>(null)

  const [heroTrail, setHeroTrail] = useState<Trail | null>(null)
  const [heroDecor, setHeroDecor] = useState<HeroDecor | null>(null)
  const [clickTrails, setClickTrails] = useState<Trail[]>([])
  const [reduceMotion, setReduceMotion] = useState(false)
  const nextId = useRef(1)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const measure = useCallback(() => {
    const wrapEl = wrapRef.current
    const startEl = triggerRef.current
    const endEl = articleRef.current
    if (!wrapEl || !startEl || !endEl) return null
    const wrap = wrapEl.getBoundingClientRect()
    const bounds: Box = { x: 0, y: 0, width: wrap.width, height: wrap.height }
    return { wrap, bounds, startEl, endEl }
  }, [])

  const makeHeroPath = useCallback(() => {
    if (reduceMotion) {
      setHeroTrail(null)
      const m = measure()
      if (m) setHeroDecor({ ellipse: ellipseAround(localBox(m.startEl, m.wrap)) })
      else setHeroDecor(null)
      return
    }
    const m = measure()
    if (!m) return
    const ellipse = ellipseAround(localBox(m.startEl, m.wrap))
    const { start, tangent } = randomPerpFromEllipse(ellipse)
    const d = generateChaoticPath({
      start,
      bounds: m.bounds,
      avoid: localBox(m.endEl, m.wrap),
      mode: 'hero',
      startTan: tangent,
    })
    setHeroDecor({ ellipse })
    setHeroTrail({ id: 0, d, duration: 3000, stem: true })
  }, [measure, reduceMotion])

  useEffect(() => {
    const id = window.setTimeout(makeHeroPath, 80)
    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(makeHeroPath, 180)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(id)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [makeHeroPath])

  const onRead = () => {
    if (reduceMotion) return
    const m = measure()
    const readEl = readRef.current
    if (!m || !readEl) return
    const start = boxCentre(localBox(readEl, m.wrap))
    const d = generateChaoticPath({
      start,
      bounds: m.bounds,
      avoid: localBox(m.endEl, m.wrap),
      mode: 'read',
    })
    const trail: Trail = { id: nextId.current++, d, duration: 6000 }
    setClickTrails((prev) => [...prev.slice(-2), trail])
  }

  return (
    <div ref={wrapRef} className="relative">
      <FeaturedHero
        title={title}
        eyebrow={eyebrow}
        repo={repo}
        author={author}
        articleRef={articleRef}
        titleRef={titleRef}
        taglineRef={taglineRef}
        triggerRef={triggerRef}
        buttonsRef={buttonsRef}
        copyRef={copyRef}
      />

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[var(--primary)]">
          <p ref={introRef}>
            All the planets are held fixed in space. An asteroid is released from rest at every
            starting point, is influenced by the gravity of the planets until it collides with one or
            runs out of the allotted maximum time. We then colour the start by which planet it hit
            (or by how long it took to collide) and in the end is a map of collision basins. The
            boundary is chaotic and looks to be Wada-like if you zoom in.
          </p>
          <p className="mt-6">
            Now make like the asteroids and click that enticing{' '}
            <button
              ref={readRef}
              type="button"
              onClick={onRead}
              className="inline cursor-pointer border-0 bg-transparent p-0 font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)] underline decoration-2 underline-offset-4 transition-colors hover:text-[var(--secondary-dark)]"
              aria-label="Draw a chaotic path to the article button"
            >
              READ
            </button>{' '}
            button.
          </p>
        </div>
      </section>

      <AsteroidField />

      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        aria-hidden
      >
        {heroDecor ? (
          <ellipse
            cx={heroDecor.ellipse.cx}
            cy={heroDecor.ellipse.cy}
            rx={heroDecor.ellipse.rx}
            ry={heroDecor.ellipse.ry}
            fill="none"
            stroke="rgb(24, 118, 158)"
            strokeWidth={2.1}
          />
        ) : null}
        {heroTrail ? (
          <GrowingArrow
            key={`hero-${heroTrail.d.slice(0, 24)}`}
            id="hero-trail"
            d={heroTrail.d}
            duration={heroTrail.duration}
            stem
          />
        ) : null}
        {clickTrails.map((t) => (
          <GrowingArrow key={t.id} id={`read-trail-${t.id}`} d={t.d} duration={t.duration} />
        ))}
      </svg>
    </div>
  )
}
