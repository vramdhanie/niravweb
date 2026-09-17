import type { Metadata } from 'next'
import Image from 'next/image'
import { Github, ImageIcon, ExternalLink } from 'lucide-react'
import VisualizerSection from '@/components/basins/VisualizerSection'
import HomeFeatured from '@/components/home/HomeFeatured'

const PROJECT = {
  title: 'Mapping Chaotic Gravitational Basins',
  eyebrow: 'Featured project',
  repo: 'https://github.com/KnobNA/RestrictiveNBodyProblem',
  author: 'Nirav Ramdhanie',
  license: 'MIT',
  tech: ['Python 3.10+', 'CuPy · CUDA GPU', 'Manim · 2D', 'VisPy · 3D', 'NumPy', 'Pillow'],
}

const GALLERY = [
  {
    src: '/images/nbody/3d_render.jpg',
    alt: '3D render of the collision basins — a lattice cube of starting points, each coloured by the planet its asteroid hits.',
    caption: 'The basins in 4-D — a 3-flat through the lattice of initial conditions.',
  },
  {
    src: '/images/nbody/equilateral_basins.jpg',
    alt: '2D slice of the collision basins for three equal masses on an equilateral triangle — each region coloured by which planet an asteroid launched from that point reaches; white rings mark the planets.',
    caption: 'A 2-D slice — three equal masses on an equilateral triangle.',
  },
  {
    src: '/images/nbody/time_basins.jpg',
    alt: 'The same basins coloured by time-to-hit — a warm red core wrapped in slower yellow-green filaments.',
    caption: 'The same system, coloured by time-to-hit.',
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
      <HomeFeatured
        title={PROJECT.title}
        eyebrow={PROJECT.eyebrow}
        repo={PROJECT.repo}
        author={PROJECT.author}
      />

      <section id="visualizer" className="scroll-mt-24 bg-[color:rgba(0,0,0,0.02)] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Interactive visualiser
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--primary-light)]">
            Explore the 4-D basins for the Restricted 4 Body System. 6.25 million asteroids were
            simulated.
          </p>

          <div className="mt-8 text-left">
            <VisualizerSection />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1170px]">
          <h2 className="font-display text-center text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
            Gallery
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[var(--primary-light)]">
            Renders and screenshots.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((img) => (
              <figure key={img.src}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[color:rgba(0,0,0,0.08)] bg-black">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-center text-sm text-[var(--primary-light)]">
                  {img.caption}
                </figcaption>
              </figure>
            ))}
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

      <section className="bg-[color:rgba(0,0,0,0.02)] px-4 py-16 md:py-20">
        <div className="mx-auto max-w-[1000px] text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--primary-dark)] md:text-3xl">
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
