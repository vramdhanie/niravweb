import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { MathBlock, MathInline } from '@/components/article/Math'
import Figure from '@/components/article/Figure'

const REPO = 'https://github.com/vramdhanie/RestrictiveNBodyProblem'
const IMG = '/images/nbody/article'

export const metadata: Metadata = {
  title: 'Restricted n-body basins in n dimensions',
  description:
    'How and why I built a GPU simulation of the restricted n-body problem — chaotic gravitational basins, rotations in n dimensions, and a first look at relativistic motion. By Nirav Ramdhanie.',
}

export default function ArticlePage() {
  return (
    <div className="px-4 py-10 md:py-14">
      <article className="mx-auto max-w-[760px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
        >
          <ArrowLeft size={16} />
          Back home
        </Link>

        <header className="mt-6 mb-2">
          <p className="text-xs font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]">
            Mapping Chaotic Gravitational Basins
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-[var(--primary-dark)] md:text-4xl">
            Restricted <MathInline tex="n" />-body basins in <MathInline tex="n" /> dimensions
          </h1>
          <p className="mt-3 text-[var(--primary-light)]">
            Nirav Ramdhanie · September 2026 ·{' '}
            <a
              href={REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--secondary)] underline underline-offset-2"
            >
              <Github size={14} /> source
            </a>
          </p>
        </header>

        <Figure
          src={`${IMG}/fig1.jpg`}
          alt="Collision basins for three equal masses on an equilateral triangle: red, blue and green regions with radial filaments."
          width={1600}
          height={900}
          priority
          caption="Figure 1. Restricted 4-body system — three fixed planets, collision basins coloured by which planet each asteroid hits."
        />

        <div className="article-prose mt-8">
          <h2>My misconceptions</h2>
          <p>
            I used to think gravitational basins looked like Figure 2: three white “planets,”
            unaffected by one another’s gravity, each owning a coloured region. Drop an “asteroid”
            anywhere in the green region (at rest) and it falls into the green planet — or so I
            thought.
          </p>

          <Figure
            src={`${IMG}/fig2.jpg`}
            alt="A clean three-colour Voronoi-style diagram with three white dots — the naive picture of gravitational basins."
            width={1600}
            height={895}
            caption="Figure 2. What I wrongly assumed the basins would look like — a tidy Voronoi partition."
          />

          <p>
            That picture ignores something important: every planet shapes the gravitational field
            the asteroids move through. An asteroid can miss the nearest planet entirely, swing
            around the system, and end up colliding with any of them. The closest planet is not
            guaranteed to be the one it hits.
          </p>
          <p>
            So I built a GPU simulation of the <strong>restricted n-body problem</strong>: a system
            of <MathInline tex="n" /> bodies in which <MathInline tex="n-1" /> are fixed masses and
            the last is a particle of negligible mass moving in their combined field. I’ll call the
            fixed masses <em>planets</em> and the negligible mass an <em>asteroid</em>. Each asteroid
            moves through Euclidean <MathInline tex="n" />-space under Newtonian inverse-square
            gravity until it either collides with a planet of finite radius or runs out of time (a
            cutoff). I launch one asteroid per pixel (or lattice point) and colour its starting point
            by which planet it hits — or, optionally, by how long the fall takes. The result is an
            image of the system’s gravitational basins.
          </p>

          <h2>The physical model</h2>
          <p>
            Because the planets never move, they don’t define a self-consistent n-body spacetime, and
            this isn’t the circular restricted three-body problem either. They are fixed “wells.”
            Each asteroid at position <MathInline tex="\mathbf{x}" /> feels
          </p>
          <MathBlock tex="\mathbf{a}(\mathbf{x}) = \sum_{i} G\, m_i\, \frac{\mathbf{p}_i - \mathbf{x}}{\lVert \mathbf{p}_i - \mathbf{x}\rVert^{\,e}}, \qquad e = 3," />
          <p>
            inverse-square by default, even when the ambient dimension <MathInline tex="n" /> is
            greater than 3. That was a deliberate modelling choice: gravity as it behaves in
            three-dimensional space, embedded in a higher-dimensional Euclidean space — not Gauss’s
            law in <MathInline tex="n" /> dimensions (which would fall off as{' '}
            <MathInline tex="1/r^{\,n-1}" />).
          </p>
          <p>
            Every asteroid starts at rest. A collision is a true geometric intersection with an{' '}
            <MathInline tex="(n-1)" />-sphere of radius <MathInline tex="R" />: between time-steps I
            form the line segment from the asteroid’s previous position to its current one, and if
            that segment crosses a planet, the first planet it meets counts as the hit. Motion is
            integrated with per-particle RK4 on the GPU; near a surface the step is CFL-limited so it
            can’t jump over the sphere. I colour the starting point with the colour of the planet it
            hits; if an asteroid survives to the maximum time, I colour its start black. Together
            these colours paint the basins.
          </p>
          <p>
            An optional map colours each start by collision time instead. I added it mostly to see
            how it would look — and it looks good.
          </p>

          <Figure
            src={`${IMG}/fig3.jpg`}
            alt="The same system coloured by time-to-hit: red interiors collide quickly, yellow-green filaments take much longer."
            width={1600}
            height={900}
            caption="Figure 3. Coloured by time-to-hit instead of by planet — red is fast, the filamentary sea is slow."
          />

          <p>
            There’s also an optional first-post-Newtonian (1PN) “geodesic” flag, which I added out of
            curiosity. It’s geodesic motion in a prescribed static multi-mass potential, not
            general-relativistic three-body physics.
          </p>

          <Figure
            src={`${IMG}/fig4.jpg`}
            alt="Collision basins with the geodesic flag on — visibly different filament structure from Figure 1."
            width={1600}
            height={900}
            caption="Figure 4. The same system with the geodesic flag on. Notice the physical difference between Figure 1 and Figure 4."
          />

          <Figure
            src={`${IMG}/fig5.jpg`}
            alt="The VisPy desktop viewer: a 3-D cube of coloured points with a control panel for slices, planes and planets."
            width={1600}
            height={1057}
            dark
            caption="Figure 5. The same basins visualised in 4-D — a 3-flat through the cube of initial conditions, with sliders for the extra axis."
          />

          <h2>Why rotations don’t grow linearly</h2>
          <p>
            I hit a question along the way: what’s the most efficient way to describe a cube in
            n-dimensional space? I needed this because I wanted to visualise higher-dimensional
            basins, using a 3-dimensional cube as a window — a 3-dimensional cross-section. I’d
            assumed the number of rotations grew linearly with dimension. I was wrong again.
          </p>
          <p>
            Translations in <MathInline tex="\mathbb{R}^{n}" /> have <MathInline tex="n" /> degrees of
            freedom, one per axis. Rotations don’t behave so simply. The orientation-preserving
            rotations of <MathInline tex="\mathbb{R}^{n}" /> form the special orthogonal group{' '}
            <MathInline tex="SO(n)" />: the real <MathInline tex="n \times n" /> matrices{' '}
            <MathInline tex="R" /> with
          </p>
          <MathBlock tex="R^{\mathsf{T}} R = I, \qquad \det R = +1." />
          <p>
            The constraint <MathInline tex="R^{\mathsf{T}} R = I" /> says the columns form an
            orthonormal basis. Infinitesimally, <MathInline tex="R = I + A" /> with{' '}
            <MathInline tex="A" /> skew-symmetric (<MathInline tex="A^{\mathsf{T}} = -A" />), and a
            skew-symmetric matrix is fixed by its strictly upper-triangular entries — one independent
            number for each unordered pair of axes. There are <MathInline tex="\binom{n}{2}" /> such
            pairs, so
          </p>
          <MathBlock tex="\dim SO(n) = \binom{n}{2} = \frac{n(n-1)}{2}." />
          <p>
            That’s quadratic in <MathInline tex="n" />. Each pair of coordinates spans a plane, and
            each plane carries its own rotation angle. In 2D there’s one plane and one angle; in 3D
            there are three (yaw, pitch, roll); in 4D there are already six independent rotations; in
            10D, forty-five.
          </p>
          <p>
            That’s also why a 2D image of this system is a 2-flat (an affine 2-plane) in{' '}
            <MathInline tex="\mathbb{R}^{n}" />, simulated with one asteroid per pixel, after which
            the motion is still <MathInline tex="n" />-dimensional. A 3D view is a 3-flat through an{' '}
            <MathInline tex="n" />-dimensional cube of initial conditions, with the extra axes chosen
            by sliders. An <MathInline tex="(n-1)" />-sphere of radius <MathInline tex="R" /> meets a
            3-flat in a ball of apparent radius <MathInline tex="\sqrt{R^{2} - d^{2}}" />, or not at
            all if its centre lies farther than <MathInline tex="R" /> from that flat. You can even
            mix planet dimensions — a 3D mass in 4D simply sits at <MathInline tex="w = 0" /> by
            padding.
          </p>

          <Figure
            src={`${IMG}/fig6.jpg`}
            alt="A plain white wireframe cube on black — the 3-D viewing window."
            width={1600}
            height={1471}
            dark
            caption="Figure 6. The cube that took a lot of effort to build."
          />

          <h2>What the basins actually look like</h2>
          <p>
            I ran simulations for essentially one system: three equal masses on an equilateral
            triangle. As it turns out, the rest-start collision map is not a tidy Voronoi diagram.
            Close in, each planet has a compact capture region, analogous to a Roche lobe. Far away,
            the combined field is nearly that of a single point mass, so an asteroid starting at rest
            falls almost radially — and which planet it finally hits is decided by tiny deflections as
            it threads the triangle, so the far field looks like radial stripes. Between those two
            regimes, the boundary is deeply chaotic.
          </p>
          <p>
            That structure is a basin of attraction in configuration space (here, the space of
            initial positions at zero velocity). The images show the hallmarks of{' '}
            <strong>Wada basins</strong>, where the boundary of each colour is at the same time a
            boundary of all the colours. A set <MathInline tex="B" /> is a Wada boundary if every open
            neighbourhood of a point of <MathInline tex="B" /> meets every basin — so there’s no edge
            that separates “only red from blue.” Any neighbourhood of the boundary contains red, blue
            and green at once.
          </p>
          <p>
            I didn’t prove the Wada property. I learnt the definition by zooming into a boundary and
            watching new basins keep appearing inside it; what I found looks consistent with Wada
            behaviour. The boundary is fractal in the practical sense that its apparent length grows
            under refinement, and deciding which planet an asteroid on the boundary will hit is
            unstable under arbitrarily small shifts of its starting point — a sensitive dependence on
            initial conditions.
          </p>
          <p>
            Colouring by time-to-hit makes the slow layer obvious: the interiors of the lobes collide
            quickly (red), while the filamentary sea takes much longer (green/blue). See Figure 3.
          </p>

          <h2>How I built it</h2>
          <p>
            I used Python, NumPy and CuPy. Each asteroid is an independent initial-value problem, so
            the natural parallelism is one asteroid per unit of GPU work, compacting finished
            particles out of the working set as they collide. I render 2D stills with Manim (the
            pixel count is the asteroid count). I visualise the n-dimensional lattice with VisPy: a
            white 3-cube for the first three sampling axes, sliders for the rest, and a union of
            coordinate-plane slices. Each run can be saved as an <code>.npz</code> file (initial
            lattice, hit index, collision time) and reopened without re-simulating.
          </p>

          <Figure
            src={`${IMG}/fig7.jpg`}
            alt="The viewer's control panel: sliders for the extra dimension, coordinate-plane toggles, planet checkboxes and colouring options."
            width={773}
            height={1600}
            dark
            caption="Figure 7. The viewer’s settings — extra-dimension slider, coordinate-plane unions, planet toggles and colour modes."
          />

          <h2>A first look at relativistic motion</h2>
          <p>
            The relativistic flag was never the point of the program, but it was the hardest physics
            I had to get straight. What would the system look like under relativistic motion? Another
            curious question — so I tried to implement it. I’m not certain it’s correct, but things
            look different, which makes me think something is working.
          </p>
          <p>
            Exact multi-planet general relativity has no closed-form metric. Einstein’s equations are
            nonlinear, so you can’t add up a Schwarzschild solution for each mass and call the sum a
            spacetime. I wanted the asteroid to feel all of the frozen planets at once, and the
            consistent choice — given planets held fixed by hand — is geodesic motion of a test
            particle in a prescribed static multi-mass field. The planets are boundary conditions,
            not a self-consistent three-body geometry.
          </p>
          <p>
            I put the Newtonian potential{' '}
            <MathInline tex="\Phi(\mathbf{x}) = -\sum_i \dfrac{G m_i}{\lVert \mathbf{x} - \mathbf{p}_i \rVert}" />{' '}
            into the weak-field isotropic metric seen by a static observer at infinity,
          </p>
          <MathBlock tex="ds^{2} = -\left(1 + \frac{2\Phi}{c^{2}}\right)c^{2}\,dt^{2} + \left(1 - \frac{2\Phi}{c^{2}}\right)\delta_{ij}\,dx^{i}dx^{j}," />
          <p>
            and took the 3-acceleration in coordinate time from the standard 1PN geodesic equation.
            Two consequences were immediate, and new to me in practice. First, the acceleration now
            depends on the velocity, so RK4 must evaluate it afresh at every stage — acceleration as a
            function of position alone is only the Newtonian special case. Second, the expansion is a
            controlled correction to Newton only when <MathInline tex="v \ll c" /> and{' '}
            <MathInline tex="|\Phi| \ll c^{2}" />. In these units (<MathInline tex="G = 1" />, sizes of
            order one) Newtonian speeds are of order one, so <MathInline tex="c" /> can’t be huge or
            the flag is invisible; but push the field strong enough — the gravitational radius{' '}
            <MathInline tex="Gm/c^{2}" /> approaching a planet’s radius — and the same formula is being
            used outside the regime where it was derived. That’s what the “weak-field geodesic is a
            toy” warning means. The picture is still coloured in coordinate time: there is no lensing,
            no time-dilated photograph.
          </p>
          <p>
            I learnt that you don’t “turn on relativity” by sprinkling in extra{' '}
            <MathInline tex="c" /> terms, and you don’t get a three-body spacetime by superposing
            black holes. You pick a metric, write the geodesic equation in a definite time
            coordinate, and stay honest about the regime where the approximation holds.
          </p>

          <Figure
            src={`${IMG}/fig8.jpg`}
            alt="The 4-D viewer with the geodesic flag on, showing a distinctly different ring-like structure inside the cube."
            width={1600}
            height={1006}
            dark
            caption="Figure 8. The geodesic flag on, visualised in 4-D. Notice the physical difference between Figure 5 and Figure 8."
          />

          <h2>What the program is for</h2>
          <p>
            This is a poor model of orbital mechanics. The planets don’t orbit one another, the
            asteroids start at rest, and there’s no radiation pressure, no oblateness, no third-body
            ephemeris; the quantity of interest is where a collision ends, not the trajectory. I
            wouldn’t use it to design a transfer.
          </p>
          <p>
            What it is, is a clean laboratory for chaotic scattering and basin boundaries: a
            deterministic Newtonian system whose long-term fate — as a function of initial position —
            is fractal and, in the three-colour case, Wada-like. That’s the same mathematical species
            as other open Hamiltonian exit problems.
          </p>
          <p>
            It’s also a data-visualisation problem. The object of interest is a function from a region
            of <MathInline tex="\mathbb{R}^{n}" /> to a discrete label (or to a time). For{' '}
            <MathInline tex="n > 3" /> you can’t see it all at once, since we live in three
            dimensions — so I use 2-flats, 3-flats and extra-coordinate sliders to slide through the
            4th dimension and watch the basin change, with two different colourings of the same
            samples. Visualising the planets themselves by their intersection with the current flat is
            the same idea applied to the <MathInline tex="(n-1)" />-spheres.
          </p>

          <h2>What I learnt</h2>
          <ul>
            <li>
              Rotations in <MathInline tex="n" /> dimensions form <MathInline tex="SO(n)" />, with{' '}
              <MathInline tex="\tfrac{n(n-1)}{2}" /> degrees of freedom. The key point is that it’s
              quadratic, not linear — a big misconception of mine, corrected.
            </li>
            <li>
              These systems aren’t as simple as Voronoi diagrams. This is a fractal basin problem, and
              with three colours the boundary appears to behave like a Wada boundary. The chaos isn’t
              randomness, either: it’s deterministic motion whose endpoint, as a map from initial
              data, is unstable at every scale.
            </li>
            <li>
              The 1PN geodesic made something concrete — that relativistic motion is motion in a
              metric, that the Newtonian limit is a controlled expansion in <MathInline tex="v/c" />{' '}
              and <MathInline tex="\Phi/c^{2}" />, and that a multi-mass spacetime is not a sum of
              one-body solutions.
            </li>
            <li>
              A visualisation of high-dimensional data is only as honest as the cross-section you
              choose — and, in the end, it all depends on your frame of reference.
            </li>
          </ul>

          <Figure
            src={`${IMG}/fig9.jpg`}
            alt="The 4-D viewer coloured by time-to-hit: a warm red core wrapped in a slower yellow-green shell."
            width={1600}
            height={1029}
            dark
            caption="Figure 9. Coloured by time-to-hit, visualised in 4-D."
          />
          <Figure
            src={`${IMG}/fig10.jpg`}
            alt="The 4-D viewer showing only the points that collide with the red planet."
            width={1600}
            height={1044}
            dark
            caption="Figure 10. Only the set of starting points that collide with the red planet."
          />

          <h2>References</h2>
          <p className="text-sm text-[var(--primary-light)]">
            These pages helped a lot while researching the project.
          </p>
          <ul>
            <li>
              <a href="https://en.wikipedia.org/wiki/Lakes_of_Wada" target="_blank" rel="noopener noreferrer">
                Lakes of Wada
              </a>{' '}
              — Wikipedia
            </li>
            <li>
              <a
                href="https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation"
                target="_blank"
                rel="noopener noreferrer"
              >
                Newton’s law of universal gravitation
              </a>{' '}
              — Wikipedia
            </li>
            <li>
              <a href="https://en.wikipedia.org/wiki/General_relativity" target="_blank" rel="noopener noreferrer">
                General relativity
              </a>{' '}
              — Wikipedia
            </li>
            <li>
              <a href="https://mathworld.wolfram.com/SpecialOrthogonalGroup.html" target="_blank" rel="noopener noreferrer">
                Special orthogonal group
              </a>{' '}
              — Wolfram MathWorld
            </li>
            <li>
              <a href="https://mathworld.wolfram.com/Chaos.html" target="_blank" rel="noopener noreferrer">
                Chaos
              </a>{' '}
              — Wolfram MathWorld
            </li>
          </ul>
        </div>

        <div className="mt-12 border-t border-[color:rgba(0,0,0,0.1)] pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </article>
    </div>
  )
}
