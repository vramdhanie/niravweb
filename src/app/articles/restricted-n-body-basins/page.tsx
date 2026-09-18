import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { MathBlock, MathInline } from '@/components/article/Math'
import Figure from '@/components/article/Figure'

const REPO = 'https://github.com/KnobNA/RestrictiveNBodyProblem'
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
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight text-[var(--primary-dark)] md:text-4xl">
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
          caption="Figure 1. Restricted 4-body system — three fixed planets, collision basins coloured by which planet each asteroid hits. Settings: geodesic flag false, time-to-hit flag false."
        />

        <div className="article-prose mt-8">
          <h2>My misconceptions</h2>
          <p>
            I thought that gravitational basins look like Figure 2. The three white dots are
            “planets” not affected by each other’s gravity, and each coloured section is their
            respective gravitational basin. If we place an “asteroid” anywhere within the green
            section (with initial velocity of 0), it will fall into the green planet… is what I thought
            would happen. But I took a good pondering session...
          </p>

          <Figure
            src={`${IMG}/fig2.jpg`}
            alt="A clean three-colour Voronoi-style diagram with three white dots — the naïve picture of gravitational basins."
            width={1600}
            height={895}
            caption="Figure 2. What I wrongly assumed the basins would look like — a tidy Voronoi partition."
          />

          <p>
            I completely negated the fact that all planets are influencing the gravitational field
            which the asteroids are placed in. Meaning there is a very plausible chance where asteroids could completely miss the
            closest planet and orbit the system and could possibly end up colliding with any of the planets.
            The closest planet doesn’t necessarily guarantee the asteroid colliding with it.
          </p>
          <p>
            So I decided to build a GPU simulation of the <strong>restricted n-body problem</strong>:
            a system of <MathInline tex="n" /> bodies where <MathInline tex="n-1" /> are fixed masses,
            and the last is a particle of negligible mass influenced by the gravitational fields of
            the fixed masses. I will refer to the fixed masses as <em>planets</em> and the negligible
            mass as <em>asteroids</em>. The asteroid moves in Euclidean{' '}
            <MathInline tex="n" />-space under Newtonian inverse-square gravity until it collides
            with a planet of a finite radius, or until the maximum allowed time by the simulation
            has passed (cutoff time). I will send an asteroid for each pixel or lattice point and it
            will be coloured by which planet it hits, or optionally by how long that takes. This will
            ultimately return an image of the gravitational basins for this system.
          </p>

          <h2>The physical model</h2>
          <p>
            Since the planets do not move, they do not define a self-consistent gravitational{' '}
            <MathInline tex="n" />-body spacetime, and they do not define a circular restricted
            three-body problem either. They are fixed “wells”. Each asteroid at position{' '}
            <MathInline tex="\mathbf{x}" /> feels
          </p>
          <MathBlock tex="\mathbf{a}(\mathbf{x}) = \sum_{i} G\, m_i\, \frac{\mathbf{p}_i - \mathbf{x}}{\lVert \mathbf{p}_i - \mathbf{x}\rVert^{\,e}}, \qquad e = 3," />
          <p>
            with default <MathInline tex="e = 3" /> (inverse square), even when the ambient
            dimension <MathInline tex="n" /> is greater than 3. This was a modelling choice. Gravity
            as in three-dimensional space, embedded in a higher-dimensional Euclidean space, not
            Gauss’s law in <MathInline tex="n" /> dimensions (which would fall as{' '}
            <MathInline tex="1/r^{\,n-1}" />
            ).
          </p>
          <p>
            All asteroids start at rest. A collision is counted through a true geometric collision
            with an <MathInline tex="(n-1)" />-sphere of radius <MathInline tex="R" />. There is a
            line segment created from the previous position of an asteroid to the current position of
            the asteroid between each time-step. If this line collides with a planet, then the first
            planet intersected will be counted as a collision. Motion is integrated with per-particle
            RK4 on the GPU; near a surface the step is CFL-limited so it cannot jump over the sphere.
            The initial position is coloured the same colour of the planet. If an asteroid reaches
            the maximum time <MathInline tex="t_{\max}" /> it colours the initial position black. This
            ultimately colours the image with the gravitational basins.
          </p>
          <p>
            An optional map colours by collision time over{' '}
            <MathInline tex="[0,\, t_{\max}]" />. I basically added this just to see how it looks,
            and it’s pretty cool.
          </p>

          <Figure
            src={`${IMG}/fig3.jpg`}
            alt="The same system coloured by time-to-hit: red interiors collide quickly, yellow-green filaments take much longer."
            width={1600}
            height={900}
            caption="Figure 3. Coloured by time-to-hit (red is fast, the filamentary sea is slow). Settings: geodesic flag true, time-to-hit flag true."
          />

          <p>
            An optional first-post-Newtonian geodesic flag exists since I was also curious. It is
            geodesic motion in a prescribed static multi-mass potential. I am not using general-relativistic
            three-body physics here.
          </p>

          <Figure
            src={`${IMG}/fig4.jpg`}
            alt="Collision basins with the geodesic flag on — visibly different filament structure from Figure 1."
            width={1600}
            height={900}
            caption="Figure 4. The same system with the geodesic flag on. Notice the physical difference between Figure 1 and Figure 4. Settings: geodesic flag true, time-to-hit flag false."
          />

          <Figure
            src={`${IMG}/fig5.jpg`}
            alt="The VisPy desktop viewer: a 3-D cube of coloured points with a control panel for slices, planes and planets."
            width={1600}
            height={1057}
            dark
            caption="Figure 5. The same basins visualised in 4-D — a 3-flat through the cube of initial conditions. Settings: geodesic flag false, time-to-hit flag false, visualised in 4-D."
          />

          <h2>Why rotations don’t increase linearly</h2>
          <p>
            I had a problem, or really just a question. What is the most efficient way to describe a
            cube in <MathInline tex="n" />-dimensional space? The reason why I needed this is because
            I wanted to visualise higher dimensions of gravitational basins. The cube is the
            3-dimensional window that you can view. A 3-dimensional cross section. I originally
            thought that the set of rotations increases linearly as the dimensions increase. I soon
            found out that I was very wrong once again. 
          </p>
          <p>
            Translations in <MathInline tex="\mathbb{R}^{n}" /> have <MathInline tex="n" /> degrees of
            freedom: one per axis. Rotations don’t act the same way. The group of
            orientation-preserving rotations of <MathInline tex="\mathbb{R}^{n}" /> is the special
            orthogonal group <MathInline tex="SO(n)" />: real <MathInline tex="n \times n" /> matrices{' '}
            <MathInline tex="R" /> with
          </p>
          <MathBlock tex="R^{\mathsf{T}} R = I, \qquad \det R = +1." />
          <p>
            The constraint <MathInline tex="R^{\mathsf{T}} R = I" /> is equivalent to the columns
            being an orthonormal basis. Infinitesimally, <MathInline tex="R = I + A" /> with{' '}
            <MathInline tex="A" /> skew-symmetric (<MathInline tex="A^{\mathsf{T}} = -A" />
            ). A skew-symmetric matrix is fixed by its strictly upper-triangular entries: one
            independent number for each unordered pair of axes. There are{' '}
            <MathInline tex="\binom{n}{2}" /> such pairs, so
          </p>
          <MathBlock tex="\dim SO(n) = \binom{n}{2} = \frac{n(n-1)}{2}." />
          <p>
            That is quadratic in <MathInline tex="n" />. Each pair of coordinates spans a plane and
            each plane carries its own rotation angle. In 2D there is one plane and one angle. In 3D
            there are three planes (yaw, pitch, roll). In 4D there are already six independent
            rotations. 10D has forty-five of them, and so on.
          </p>
          <p>
            That is why a 2D image of this system is a 2-flat (an affine 2-plane) in{' '}
            <MathInline tex="\mathbb{R}^{n}" />, simulated with one asteroid per pixel, after which
            the motion is still <MathInline tex="n" />-dimensional. A 3D view is a 3-flat through an{' '}
            <MathInline tex="n" />-dimensional cube of initial conditions. Extra axes are chosen with
            sliders. An <MathInline tex="(n-1)" />-sphere of radius <MathInline tex="R" /> meets a
            3-flat in a ball of apparent radius <MathInline tex="\sqrt{R^{2} - d^{2}}" />, or not at
            all if the centre is farther than <MathInline tex="R" /> from that flat. It is also
            possible to do mixed-dimension planets: a 3D mass in 4D sits at{' '}
            <MathInline tex="w = 0" /> by padding.
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
            See Figures 1 and 5. I pretty much did simulations for just one system: three equal masses on
            the vertices of an equilateral triangle. As I figured out, the collision map is not a 
            Voronoi diagram. If you zoom in, each planet has a compact capture region analogous to a Roche
            lobe. Far away the combined field is nearly that of a point mass, so a particle that
            starts at rest falls almost radially. Which planet the asteroid eventually hits is
            decided by tiny deflections as it threads the triangle. The far-field therefore looks
            like radial stripes. Between those two effects, the boundary is very chaotic.
          </p>
          <p>
            That structure is a basin of attraction in configuration space (here the space of
            initial positions at zero velocity). The images show the hallmarks of{' '}
            <strong>Wada basins</strong>: the boundary of each colour appears to be a boundary of all
            colours. A set <MathInline tex="W" /> is a Wada boundary if every open neighbourhood of a
            point of <MathInline tex="W" /> intersects every basin. Then there is no “edge between
            only red and blue”. Any neighbourhood of the edge contains all red, blue, and green.
          </p>
          <p>
            I never proved the Wada property to <MathInline tex="\varepsilon\text{--}\delta" />. I
            just observed this pattern by zooming in on a boundary in which the basins appear to
            continuously keep appearing in between the boundaries. The images I obtained from this
            appear to follow Wada properties. The boundary is fractal in the practical sense that its
            apparent length grows under refinement and figuring out which planet an asteroid will hit
            if its initial position is on a boundary is unstable under arbitrarily small shifts of
            the initial point. Therefore there is a sensitive dependence. See Figures 1 and 4.
          </p>
          <p>
            Colouring by time-to-hit makes the slow layer very obvious. The interiors of the lobes collide
            quickly (red). The filamentary sea takes much longer (green/blue). See Figure 3.
          </p>

          <h2>How I built the simulation</h2>
          <div className="my-8 flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            <p className="mb-0! md:flex-1">
              I used Python, NumPy, and CuPy. Each asteroid is an independent initial-value problem,
              so the natural parallelism is one asteroid per GPU block of work, compacting finished
              particles off the work set. Two-dimensional stills are rendered with Manim (pixel count
              is asteroid count). The n-D lattice is visualised with VisPy: a white 3-cube for the
              first three sampling axes, sliders are used for the rest, and a union of
              coordinate-plane slices. Each simulated run can be saved as an <code>.npz</code> file
              (initial lattice, hit index, collision time) and reopened without the need to
              re-simulate the system.
            </p>
            <Figure
              src={`${IMG}/fig7.jpg`}
              alt="The VisPy Basin controls window: extra-dimension slider, coordinate-plane toggles, planet checkboxes and colouring options."
              width={773}
              height={1600}
              variant="panel"
              caption="Figure 7. The viewer’s settings panel. Settings: VisPy “Basin controls” (extra-dimension slider, coordinate-plane unions, planet toggles, colour modes)."
            />
          </div>

          <h2>A first look at relativistic motion</h2>
          <p>
            See Figure 4. The relativistic flag was not the point of the programme, but it was the
            hardest piece of physics I had to get straight. What if the system was affected by
            relativistic motion? This was just another curious question I had and I wanted to see
            what it would change. I tried my best to implement this, I am not entirely sure if it is
            implemented properly but things look different, so it did something.
          </p>
          <p>
            Exact multi-planet general relativity is not a closed-form metric. Einstein’s equations
            are nonlinear, so you cannot add Schwarzschild solutions for each mass and call the sum a
            spacetime. I wanted the asteroid to feel all of the frozen planets at once. The
            consistent choice, given planets held fixed by hand, is geodesic motion of a test
            particle in a prescribed static multi-mass field. The planets are boundary conditions,
            not a self-consistent 3-body geometry.
          </p>
          <p>I took the Newtonian potential</p>
          <MathBlock tex="\Phi(\mathbf{x}) = -\sum_i \frac{G m_i}{\lVert \mathbf{x} - \mathbf{p}_i \rVert}," />
          <p>put into the weak-field isotropic metric seen by a static observer at infinity,</p>
          <MathBlock tex="g_{tt} \approx -\left(1 + \frac{2\Phi}{c^{2}}\right), \qquad g_{ij} \approx \left(1 - \frac{2\Phi}{c^{2}}\right)\delta_{ij}," />
          <p>
            and the 3-acceleration in coordinate time <MathInline tex="t" /> is then the standard 1PN
            geodesic form
          </p>
          <MathBlock tex="\mathbf{a} = -\nabla\Phi\left(1 + \frac{v^{2}}{c^{2}} + \frac{4\Phi}{c^{2}}\right) + \frac{4\,\mathbf{v}\,(\mathbf{v}\cdot\nabla\Phi)}{c^{2}}." />
          <p>
            Two consequences are immediate and were new to me in practice. First,{' '}
            <MathInline tex="\mathbf{a}" /> depends on velocity, so the integrator’s RK4 stages must
            evaluate <MathInline tex="\mathbf{a}(\mathbf{x},\mathbf{v})" /> at each stage.
            Acceleration as a function of position alone is the Newtonian special case. Second, the
            expansion is only a controlled correction to Newton when{' '}
            <MathInline tex="|\Phi|/c^{2} \ll 1" /> and <MathInline tex="|v|/c \ll 1" />. In these
            units (<MathInline tex="G \sim 1" />, sizes <MathInline tex="\sim 1" />) Newtonian speeds
            are order one, so <MathInline tex="c" /> cannot be huge or the flag is invisible. If
            instead <MathInline tex="2GM/c^{2}" /> is comparable to a planet’s radius, the same
            formula is being used outside its derivation. That is what the “weak-field geodesic is a
            toy” warning means. The picture is still coloured in coordinate time: there is no
            lensing, no time-dilated photograph.
          </p>
          <p>
            I learnt that you do not “turn on relativity” by adding extra{' '}
            <MathInline tex="1/r^{2}" /> terms at random, and you do not get a 3-body spacetime by
            superposing black holes. You pick a metric, write the geodesic equation in a definite
            time coordinate, and stay honest about the regime of the approximation. Implementing it
            meant accepting an approximate geodesic law and stating clearly where that approximation
            stops being a small correction.
          </p>

          <Figure
            src={`${IMG}/fig8.jpg`}
            alt="The 4-D viewer with the geodesic flag on, showing a distinctly different ring-like structure inside the cube."
            width={1600}
            height={1006}
            dark
            caption="Figure 8. Geodesic flag on, visualised in 4-D. Notice the physical difference between Figure 5 and Figure 8. Settings: geodesic flag true, time-to-hit flag false, visualised in 4-D."
          />

          <h2>What the programme is made for</h2>
          <p>
            This is quite a poor model of orbital mechanics. The planets do not orbit each other, the
            asteroids start at rest, there is no radiation pressure, no oblateness, no third-body
            ephemeris, and the quantity of interest is the endpoint of a collision, not its
            trajectory. Thus it is very unrealistic in that sense.
          </p>
          <p>
            I built this programme for the chaotic scattering of masses and the visualisation of the gravitational basin boundaries. A
            deterministic Newtonian system whose long-term fate, as a function of initial position,
            is fractal and (in the three-colour case) Wada-like. That is the same mathematical
            species as other open Hamiltonian exit problems.
          </p>
          <p>
            It is also a data-visualisation problem. The object of interest is a function from a
            region of <MathInline tex="\mathbb{R}^{n}" /> to a discrete label (or to a time). For{' '}
            <MathInline tex="n > 3" /> you cannot see it at once since we live in 3-dimensional
            space. I decided to use 2-flats, 3-flats, extra-coordinate sliders so that you can
            effectively slide through the 4th dimension and see how the basin changes. There are also
            two different colourings of the same samples. Visualising{' '}
            <MathInline tex="(n-1)" />-spheres by their intersection with the current flat is the
            same idea applied to the planets themselves.
          </p>

          <h2>What I learnt</h2>
          <p>
            Rotations in <MathInline tex="n" /> dimensions are <MathInline tex="SO(n)" />, with{' '}
            <MathInline tex="\tfrac{n(n-1)}{2}" /> degrees of freedom. The most important part is
            that it is quadratic, not linear. Big misconception I believed.
          </p>
          <p>
            I learnt that these systems aren’t as simple as Voronoi diagrams. They are fractals where
            the boundary appears to behave like a Wada boundary. The chaos here is not random either. 
            It is deterministic motion whose endpoint, as a map from initial data, is unstable at every scale.
          </p>
          <p>
            The 1PN geodesic made it clear that relativistic motion is motion in a metric. The
            Newtonian limit is a controlled expansion in <MathInline tex="v/c" /> and{' '}
            <MathInline tex="\Phi/c^{2}" />, and that a spacetime with multiple masses is not as simple as the 
            sum of one-body solutions. Implementing required me to use an approximate geodesic law and stating
            clearly where that approximation stops being a small correction. 
          </p>
          <p>
            On the engineering side I learnt that a visualisation of high-dimensional data is only as
            honest as the cross section you chose, and that it all pretty much depends on your frame
            of reference. You can&apos;t just choose a random cross section and expect the results to be meaningful.
          </p>

          <Figure
            src={`${IMG}/fig9.jpg`}
            alt="The 4-D viewer coloured by time-to-hit: a warm red core wrapped in a slower yellow-green shell."
            width={1600}
            height={1029}
            dark
            caption="Figure 9. Coloured by time-to-hit, visualised in 4-D. Settings: geodesic flag false, time-to-hit flag true, visualised in 4-D."
          />
          <Figure
            src={`${IMG}/fig10.jpg`}
            alt="The 4-D viewer showing only the points that collide with the red planet."
            width={1600}
            height={1044}
            dark
            caption="Figure 10. Only the set of starting points that collide with the red planet. Settings: geodesic flag false, time-to-hit flag false, visualised in 4-D, red-planet hits only."
          />

          <h2>References</h2>
          <p className="text-sm text-[var(--primary-light)]">
            These pages helped a lot with researching for this project. Also fun to read.
          </p>
          <ul>
            <li>
              <a
                href="https://web.archive.org/web/20150204231934/http://www-history.mcs.st-and.ac.uk/Indexes/Math_Physics.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                History Topics: Mathematical Physics Index
              </a>{' '}
              — MacTutor History of Mathematics, University of St Andrews
            </li>
            <li>
              <a
                href="https://books.google.com/books?id=yhN9CgAAQBAJ&pg=PT4#v=onepage&q&f=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                Relativity: The Special and General Theory
              </a>{' '}
              — Albert Einstein
            </li>
            <li>
              <a href="https://arxiv.org/html/1502.04632v1" target="_blank" rel="noopener noreferrer">
                Testing Chern-Simons modified gravity with orbiting superconductive gravity gradiometers
              </a>{' '}
              — Li-E Qiang and Peng Xu, arXiv:1502.04632, 2015
            </li>
            <li>
              <a
                href="https://link.springer.com/article/10.1140/epjc/s10052-026-16139-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Post-Newtonian N-body dynamics in Extended Theories of Gravity
              </a>{' '}
              — Antonio Tedesco, The European Physical Journal C, 2026
            </li>
            <li>
              <a
                href="https://www.jstage.jst.go.jp/article/tmj1911/12/0/12_0_43/_article"
                target="_blank"
                rel="noopener noreferrer"
              >
                Theory of Continuous Set of Points
              </a>{' '}
              — Kunizô Yoneyama, Tohoku Mathematical Journal, 1917
            </li>
            <li>
              <a href="https://escholarship.org/uc/item/3j38277x" target="_blank" rel="noopener noreferrer">
                On the creation of Wada basins in interval maps through fixed point tangent bifurcation
              </a>{' '}
              — Romulus Breban and Helena E. Nusse, Physica D, 2005
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
