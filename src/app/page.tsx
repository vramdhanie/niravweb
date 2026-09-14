import type { Metadata } from 'next'
import Image from 'next/image'
import {
  Github,
  Orbit,
  Zap,
  Target,
  Layers,
  Sparkles,
  ImageIcon,
  ExternalLink,
} from 'lucide-react'
import VisualizerSection from '@/components/basins/VisualizerSection'

// Featured project — content drawn from the project README.
// More detail, screenshots, and the live visualizer will be added later.
const PROJECT = {
  title: 'Mapping Chaotic Gravitational Basins',
  eyebrow: 'Featured project',
  tagline:
    'GPU-accelerated basins of attraction: launch an asteroid from rest at every point in space and colour it by the planet it eventually collides with.',
  repo: 'https://github.com/vramdhanie/RestrictiveNBodyProblem',
  author: 'Nirav Ramdhanie',
  license: 'MIT',
  tech: ['Python 3.10+', 'CuPy · CUDA GPU', 'Manim · 2D', 'VisPy · 3D', 'NumPy', 'Pillow'],
}

// Renders / screenshots. More to come from Nirav.
const GALLERY = [
  {
    src: '/images/nbody/3d_render.jpg',
    alt: '3D render of the collision basins — a lattice cube of starting points, each coloured by the planet its asteroid hits.',
  },
  {
    src: '/images/nbody/equilateral_basins.jpg',
    alt: '2D slice of the collision basins for three equal masses on an equilateral triangle — each region coloured by which planet an asteroid launched from that point reaches; white rings mark the planets.',
  },
]

const FEATURES = [
  {
    icon: Orbit,
    title: 'Fixed planets, one test mass',
    body: 'The planets stay put and attract (a negative mass would repel). A single asteroid starts at rest at each sample point and feels Newtonian inverse-square gravity.',
  },
  {
    icon: Zap,
    title: 'GPU-accelerated RK4',
    body: 'Per-particle Runge–Kutta integration on the GPU (CuPy) advances millions of asteroids at once — a four-axis cube can exceed five million trajectories.',
  },
  {
    icon: Target,
    title: 'True geometric collisions',
    body: 'A hit is a real intersection with a planet’s n-sphere, tested across the whole swept step, so fast trajectories can’t tunnel through a planet.',
  },
  {
    icon: Layers,
    title: '2D stills & n-D exploration',
    body: 'Render 2D basin images with Manim, or sample a k-dimensional cube of initial conditions and fly through it in an interactive 3D viewer (VisPy).',
  },
]

export const metadata: Metadata = {
  title: { absolute: 'Mapping Chaotic Gravitational Basins | Snap, Crackle and Pop' },
  description:
    'GPU-accelerated basins of attraction for a restricted n-body problem, by Nirav Ramdhanie.',
}

export default function HomePage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <section
        className="px-4 py-24 text-center text-[var(--text-on-dark)] md:py-32"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--primary-dark), var(--secondary-dark))' }}
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary-light)]">
            {PROJECT.eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            {PROJECT.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            {PROJECT.tagline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={PROJECT.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border-2 border-white px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-white no-underline transition-all duration-300 hover:bg-white hover:text-[var(--primary-dark)]"
            >
              <Github size={18} />
              View on GitHub
            </a>
            <a
              href="#visualizer"
              className="inline-flex items-center gap-2 rounded px-6 py-2.5 font-bold uppercase tracking-[var(--main-spacing)] text-white/90 no-underline transition-colors hover:text-white"
            >
              <Sparkles size={18} />
              Explore the visualizer
            </a>
          </div>
          <p className="mt-8 text-sm text-white/60">
            An open-source physics simulation by {PROJECT.author}.
          </p>
        </div>
      </section>

      {/* ---- What it does ---- */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1000px]">
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[var(--primary)]">
            This is not a full n-body integration. Instead the planets are held fixed and a single
            asteroid is released from rest at each starting point. Follow it under gravity until it
            collides with a planet, then colour that starting point by the planet it hit — the result
            is a map of <em>collision basins</em>.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-[color:rgba(0,0,0,0.08)] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--secondary-light)] text-[var(--secondary-dark)]">
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--primary-dark)]">{title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--primary-light)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Interactive visualizer (placeholder) ---- */}
      <section id="visualizer" className="scroll-mt-24 bg-[color:rgba(0,0,0,0.02)] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Interactive visualizer
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--primary-light)]">
            Explore the 4-D collision basins live — rotate the cube, slide through the fourth
            dimension, and isolate coordinate planes, right in the browser.
          </p>

          <div className="mt-8 text-left">
            <VisualizerSection />
          </div>
        </div>
      </section>

      {/* ---- Gallery (placeholder) ---- */}
      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1170px]">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Gallery
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--primary-light)]">
            Renders and screenshots will appear here.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[color:rgba(0,0,0,0.08)] bg-black"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))}
            {/* TODO: add more renders/screenshots as Nirav provides them. */}
            {Array.from({ length: Math.max(0, 3 - GALLERY.length) }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border border-[color:rgba(0,0,0,0.08)] bg-[color:rgba(0,0,0,0.03)]"
              >
                <div className="text-center text-[var(--primary-light)]">
                  <ImageIcon size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm opacity-70">Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Built with / repo ---- */}
      <section className="bg-[color:rgba(0,0,0,0.02)] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Built with
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {PROJECT.tech.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:rgba(0,0,0,0.1)] bg-white px-4 py-1.5 text-sm text-[var(--primary)]"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--primary-light)]">
            Runs on an NVIDIA GPU (CuPy / CUDA); macOS is not supported.
          </p>

          <div className="mt-10">
            <a
              href={PROJECT.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-[var(--primary-dark)] px-5 py-2.5 font-medium text-[var(--primary-dark)] no-underline transition-all duration-300 hover:bg-[var(--primary-dark)] hover:text-white"
            >
              <Github size={18} />
              Source on GitHub
              <ExternalLink size={15} />
            </a>
            <p className="mt-4 text-xs text-[var(--primary-light)]">
              {PROJECT.license}-licensed · © 2026 {PROJECT.author}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
