'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Github } from 'lucide-react'
import EarlierProjectCard from '@/components/home/EarlierProjectCard'
import FallingCube from '@/components/home/FallingCube'
import HeroArrow from '@/components/home/HeroArrow'

const REPO = 'https://github.com/KnobNA/physics_combat_sim'

// One loop, measured from each file's frame delays. Shown twice, then the next clip.
const CLIPS = [
  { src: '/images/PhysicsEngine/GIFofBallSloMo.gif', ms: 8900 },
  { src: '/images/PhysicsEngine/GIFBallintoCube.gif', ms: 5170 },
  { src: '/images/PhysicsEngine/RealGIFofBall.gif', ms: 5000 },
] as const

const PLAYS = 2

const GALLERY = [
  {
    src: '/images/PhysicsEngine/Environment.png',
    alt: 'The simulator arena: a hollow aluminum box on the floor of a wireframe cage, with the assembly and environment panels open.',
    caption: 'The arena — a hollow aluminum box, with the controls open.',
  },
  {
    src: '/images/PhysicsEngine/Ball.png',
    alt: 'A blue faceted sphere resting on the grid, with a stress readout of 43.6 kPa.',
    caption: 'A sphere at rest. The readout is 43.6 kPa.',
  },
  {
    src: '/images/PhysicsEngine/BeforeElastic.png',
    alt: 'A solid blue cube resting on the grid, still in its starting shape.',
    caption: 'The cube before the hit.',
  },
  {
    src: '/images/PhysicsEngine/AfterElastic.png',
    alt: 'The same cube after impact, flattened into a plate and coloured from orange to red by stress.',
    caption: 'The cube after the hit, coloured by stress.',
  },
  {
    src: '/images/PhysicsEngine/GIFBallintoCube.gif',
    alt: 'A sphere driven into a cube on the arena grid.',
    caption: 'A sphere driven into a cube.',
  },
  {
    src: '/images/PhysicsEngine/ShowHeatSource.png',
    alt: 'An orange heat source held against the face of a blue cube.',
    caption: 'A heat source held on the cube.',
  },
  {
    src: '/images/PhysicsEngine/ShowTemp.png',
    alt: 'The cube coloured by temperature, hot yellow on the heated face and cool blue on the far side.',
    caption: 'Temperature after the heat soaks in.',
  },
  {
    src: '/images/PhysicsEngine/ShowStressForTemp.png',
    alt: 'The same cube coloured by stress, with red and orange where the temperature gradient is steepest.',
    caption: 'Stress from that temperature difference.',
  },
  {
    src: '/images/PhysicsEngine/RealGIFofBall.gif',
    alt: 'A sphere moving through the wireframe arena, with the simulator controls open.',
    caption: 'A sphere in the arena.',
  },
  {
    src: '/images/PhysicsEngine/GIFofBallSloMo.gif',
    alt: 'A slow-motion view of a sphere in the wireframe arena.',
    caption: 'The same kind of drop, slowed down.',
  },
  {
    src: '/images/PhysicsEngine/GIFBallLandBall.gif',
    alt: 'A sphere landing in the arena, with the stress colour scale in the corner.',
    caption: 'A sphere landing in the arena.',
  },
] as const

function HeroBackdrop() {
  const [reduce, setReduce] = useState(false)
  const [clips, setClips] = useState<{ a: number; b: number | null }>({ a: 0, b: null })
  const [show, setShow] = useState<'a' | 'b'>('a')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduce(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (reduce) return
    for (const clip of CLIPS) {
      const img = new window.Image()
      img.src = clip.src
    }

    let alive = true
    const timers = new Set<number>()
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        if (alive) fn()
      }, ms)
      timers.add(id)
    }

    const arm = (clip: number, slot: 'a' | 'b') => {
      later(() => {
        const next = (clip + 1) % CLIPS.length
        const hidden = slot === 'a' ? 'b' : 'a'
        setClips((prev) => ({ ...prev, [hidden]: next }))
        later(() => setShow(hidden), 50)
        arm(next, hidden)
      }, CLIPS[clip].ms * PLAYS)
    }

    arm(0, 'a')
    return () => {
      alive = false
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [reduce])

  const layer = (slot: 'a' | 'b', clip: number | null) => {
    if (clip == null) return null
    const shown = show === slot
    return (
      <Image
        key={`${slot}-${clip}`}
        src={CLIPS[clip].src}
        alt=""
        fill
        priority={slot === 'a' && clip === 0}
        unoptimized
        sizes="100vw"
        className={`object-cover transition-opacity duration-700 ease-in-out ${shown ? 'opacity-100' : 'opacity-0'}`}
      />
    )
  }

  return (
    <div className="absolute inset-0 bg-[#111113]">
      {layer('a', clips.a)}
      {layer('b', clips.b)}
    </div>
  )
}

export default function PhysicsEngineHome() {
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const hereRef = useRef<HTMLSpanElement>(null)
  const articleRef = useRef<HTMLAnchorElement>(null)
  const githubRef = useRef<HTMLAnchorElement>(null)

  return (
    <div ref={trackRef} className="theme-dark relative">
      <FallingCube trackRef={trackRef} />

      <section
        ref={sectionRef}
        className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-4 py-16 md:py-24"
      >
        <HeroBackdrop />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.48) 42%, rgba(0,0,0,0.14) 72%, transparent 100%)',
          }}
        />
        <div className="relative z-[2] w-full max-w-3xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]">
            Featured project
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--primary-dark)] md:text-6xl">
            Custom Physics Engine<sup className="text-[0.55em]">*</sup>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--primary)]">
            I decided to build my own physics engine*. What came next, was shocking. Mind boggling. Jaw dropping. Brain melting. Explosions. Click <span ref={hereRef}>here</span> to blow up!
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              ref={articleRef}
              href="/articles/custom-physics-engine"
              className="inline-flex items-center gap-2 rounded bg-white px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-[#141416] no-underline transition-transform duration-300 hover:scale-105"
            >
              <BookOpen size={18} />
              Read the full article
            </Link>
            <a
              ref={githubRef}
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border-2 border-white/80 px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-white no-underline transition-all duration-300 hover:bg-white hover:text-[#141416]"
            >
              <Github size={18} />
              View on GitHub
            </a>
          </div>
        </div>
        <HeroArrow
          sectionRef={sectionRef}
          hereRef={hereRef}
          articleRef={articleRef}
          githubRef={githubRef}
        />
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[var(--primary)]">
          <p>
            I decided to build my own physics engine. This decision was not my best decision ever,
            but I am going to save you all the trouble in describing all the issues and problems I
            encountered while building this and just show you what my research mapped. Basically the
            core mathematics and physics required to make it work. At the end I have some data comparisons
            which are pretty cool. 
          </p>
        </div>
        <div className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[var(--primary)]">
        <p className="mt-10">
            [No web visualiser tool for this one.]
          </p>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1170px]">
          <h2 className="font-display text-center text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Gallery
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--primary-light)]">
            Images and GIFs of the physics engine*.
          </p>

          <div className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-3">
            {GALLERY.map((img) => (
              <figure key={img.src} className="w-[min(78vw,380px)] shrink-0 snap-start">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-black">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    unoptimized={img.src.endsWith('.gif')}
                    sizes="380px"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-center text-sm text-[var(--primary-light)]">
                  {img.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 pt-8 pb-20">
        <div className="mx-auto max-w-3xl">
          <EarlierProjectCard />
        </div>
      </div>
    </div>
  )
}
