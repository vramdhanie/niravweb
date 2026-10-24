import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Github } from 'lucide-react'
import 'katex/dist/katex.min.css'
import { MathBlock, MathInline } from '@/components/article/Math'
import Figure from '@/components/article/Figure'

const REPO = 'https://github.com/KnobNA/physics_combat_sim'

const LAB_ROWS = [
  ['Free Fall Drop', 'Hollow Aluminum Box', 'Rebound distance', '0.2046 m', '0.2061 m', '−0.71 %', 'Perfect'],
  ['Free Fall Drop', 'Solid Aluminum Cube', 'Rebound distance', '0.2016 m', '0.2031 m', '−0.71 %', 'Perfect'],
  ['Sliding Block Stop', 'Aluminum', 'Stopping distance', '0.315 m', '0.313 m', '+0.30 %', 'Perfect'],
  ["Young's Modulus (E)", 'Aluminum 6061-T6', 'Tensile stiffness', '71.26 GPa', '68.90 GPa', '+3.40 %', 'Good'],
  ["Young's Modulus (E)", 'A36 Mild Steel', 'Tensile stiffness', '206.30 GPa', '200.00 GPa', '+3.10 %', 'Good'],
  ["Young's Modulus (E)", 'AR500 Steel', 'Tensile stiffness', '211.70 GPa', '205.00 GPa', '+3.30 %', 'Good'],
  ["Poisson's Ratio", 'Aluminum 6061-T6', 'Sideways strain per stretch', '0.341', '0.330', '+3.30 %', 'Good'],
  ['Shear Modulus (G)', 'Aluminum 6061-T6', 'Shear stiffness', '23.32 GPa', '25.90 GPa', '−10.00 %', 'Acceptable'],
  ['Rebound Energy', 'Elastomer Pad', 'Energy returned', '4.3 %', '~4.0 to 5.0 %', 'N/A', 'Matches Bayshore'],
  ['Charpy Impact Analog', 'Aluminum 6061-T6', 'Energy absorbed', '5.37 J', '10 to 40 J', 'FAIL', 'Method error'],
  ['Yield Overload', 'All Metals tested', 'Behavior past yield', 'Diverged', 'Plastic Deformation', 'FAIL', 'Crashed :('],
  ['Crush / Punch', 'Soda-Lime Glass', 'Whether it cracks', 'Diverged', 'Shatter / Cracks', 'FAIL', 'Crashed :('],
] as const

export const metadata: Metadata = {
  title: 'Building My Own Robot Simulator',
  description:
    'The mathematics and physics behind a custom finite-element engine for robot combat — elasticity, plasticity, fracture, contact, and how the lab comparisons turned out. By Nirav Ramdhanie.',
}

export default function CustomPhysicsEngineArticle() {
  return (
    <div className="theme-dark min-h-screen px-4 py-10 md:py-14">
      <article className="mx-auto max-w-[760px]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
        >
          <ArrowLeft size={16} />
          Back to the project
        </Link>

        <header className="mt-6 mb-2">
          <p className="text-xs font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]">
            Custom Physics Engine*
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight text-[var(--primary-dark)] md:text-4xl">
            Building My Own Robot Simulator
          </h1>
          <p className="mt-3 text-[var(--primary-light)]">
            Nirav Ramdhanie · October 2026 ·{' '}
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
          src="/images/PhysicsEngine/Environment.png"
          alt="The simulator arena: a small hollow aluminum box on the floor of a wireframe cage, with the assembly and environment panels open."
          width={1918}
          height={1012}
          priority
          caption="Figure 1. The environment. Settings on the right, and your time controls after you simulate at the bottom. Used the same cube maths from the first project."
        />

        <div className="article-prose mt-8">
          <p>
            I joined my college robotics club recently. We focus on robot fights. That's super cool and all, but my
            experience with robotics is actually quite minimal. I usually focus more on theoretical
            stuff, but when it comes to building a tangible system... yes. So alongside learning
            valuable skills like using CAD and 3D printing and PCB stuff, I want to learn the
            physics. That is what most interests me.
          </p>
          <p>
            Do you know the best way to learn something new? I can tell you that it is definitely not how I decided to
            go about it.
          </p>
          <p>
            I decided to build my own physics engine. This decision was not my best decision ever, but I am going to save you all the trouble in
            describing all the issues and problems I encountered while building this and just show
            you what my research mapped. Basically the core mathematics and physics required to make
            it work.
          </p>

          <h2>What is even going on?</h2>
          <p>
            Every deformable part in the simulation is a finite-element body in three-dimensional
            space. The main unknown we solve for is the nodal motion. We use a Hilber-Hughes-Taylor
            (HHT) stepper to advance the motion. We use Pardiso to factor the Newton matrix. I made
            it so that between two objects you can weld them together. These welds act as algebraic
            constraints. Things like contact, gravity, aerodynamic drag, and user loads apply nodal
            forces. Heat is calculated in a separate explicit balance. This heat changes the
            mechanical moduli and causes thermal strain. When a piece breaks off the main mesh it
            becomes its own rigid body.
          </p>

          <h2>1. Tetrahedrons and Kinematics</h2>
          <p>
            Tetrahedrons (tets). Great shape, amazing shape even, haven&apos;t seen better. These
            four nodes have reference positions <MathInline tex="X_a" /> and current positions{' '}
            <MathInline tex="x_a" />. The deformation gradient is constant on the tet.{' '}
            <MathInline tex="N_a" /> are the reference shape functions. The deformation gradient{' '}
            <MathInline tex="F" /> is:
          </p>
          <MathBlock tex="F = \sum_{a=1}^{4} x_a \otimes \nabla N_a" />
          <p>
            We use polar decomposition to separate rotation and stretch. This allows constitutive
            work to use the stretch <MathInline tex="U" /> while forces are rotated back by{' '}
            <MathInline tex="R" />:
          </p>
          <MathBlock tex="F = RU" />
          <p>
            We calculate the signed volume of the tetrahedron for mass and energy. The absolute
            value is taken here:
          </p>
          <MathBlock tex="V_{tet} = \frac{1}{6}\left|(b-a)\cdot((c-a)\times(d-a))\right|" />

          <h2>2. Elasticity and Temperature</h2>
          <p>
            Temperature <MathInline tex="T" /> changes how the material behaves. The Young modulus{' '}
            <MathInline tex="E" /> uses a retention factor <MathInline tex="s(T)" /> clamped to{' '}
            <MathInline tex="[10^{-4}, 1]" />. We use Lamé parameters for the elasticity matrix:
          </p>
          <MathBlock tex="\mu = \frac{E s_E}{2(1+\nu)}" />
          <MathBlock tex="\lambda = \frac{E s_E \nu}{(1+\nu)(1-2\nu)}" />
          <p>
            Thermal expansion and committed plastic strain <MathInline tex="\epsilon^p" /> are
            subtracted from the mechanical strain first.
          </p>

          <h2>3. Plasticity, High-Speed Impacts, and Tearing</h2>
          <p>
            For metal parts like aluminum armor we use J2 plasticity. We calculate the von Mises
            stress <MathInline tex="\sigma_{vm}" /> from the deviatoric stress <MathInline tex="S" />:
          </p>
          <MathBlock tex="\sigma_{vm} = \sqrt{\frac{3}{2} S : S}" />
          <p>
            Collisions can happen in milliseconds. My original mathematical model relied on
            quasi-static loading based strictly on offset yield and elongation. That is not very
            realistic for my simulator. Materials must get stronger at high strain rates. To fix
            this I am incorporating a strain-rate dependency using a Cowper-Symonds multiplier. This
            scales the dynamic yield stress <MathInline tex="\sigma_y^{dyn}" /> based on the strain
            rate <MathInline tex="\dot{\epsilon}" />:
          </p>
          <MathBlock tex="\sigma_y^{dyn} = \sigma_y \left( 1 + \left( \frac{\dot{\epsilon}}{C} \right)^{1/p} \right)" />
          <p>
            My original model also faked material necking by just fading the stress. Real ductile
            failure depends heavily on stress triaxiality. I am adding a failure threshold that
            evaluates the hydrostatic tension. This allows the aluminum armor to tear accurately
            under complex multidirectional impacts instead of just fading away.
          </p>
          <Figure
            src="/images/PhysicsEngine/BeforeElastic.png"
            alt="A solid blue cube resting on the grid, still in its starting shape."
            width={1100}
            height={773}
            caption="Figure 2. Cube falling at 50m/s towards the floor."
          />
          <Figure
            src="/images/PhysicsEngine/AfterElastic.png"
            alt="The same cube after impact, flattened into a plate and coloured from orange to red by stress."
            width={800}
            height={581}
            caption="Figure 3. Cube collided with the floor at 50m/s, leaving a pretty large mark."
          />

          <h2>4. Breaking Brittle Stuff</h2>
          <p>
            Brittle materials like soda-lime glass use a Rankine response. The principal stresses
            are clamped to the tensile strength <MathInline tex="f_t" />.
          </p>
          <p>
            A face opens when the trial tension reaches the strength limit and passes a Griffith
            energy gate. The mode I toughness <MathInline tex="K_{Ic}" /> gives us the release rate{' '}
            <MathInline tex="G_c" />:
          </p>
          <MathBlock tex="G_c = \frac{K_{Ic}^2 (1-\nu^2)}{E}" />
          <p>
            The element must store enough energy to create a new face of area <MathInline tex="A" />:
          </p>
          <MathBlock tex="\frac{1}{2} \frac{\sigma_t^2}{E} V \ge G_c A" />
          <p>
            When pieces break off and fall below a minimum shard size they leave the mesh. They
            become rigid chips with their own mass and inertia. [No image because its currently broken right now.]
          </p>

          <h2>5. Rubber and Compliant Materials</h2>
          <p>
            For 3D printed TPU or hard elastomers we use a Mooney-Rivlin hyperelastic law. We must
            cap the bulk modulus <MathInline tex="\kappa" /> so it does not become infinite when
            Poisson&apos;s ratio <MathInline tex="\nu" /> approaches <MathInline tex="0.5" />:
          </p>
          <MathBlock tex="\kappa = \frac{E}{3 \max(1-2\nu,\, 0.02)}" />
          <p>
            We evaluate the First Piola-Kirchhoff stress <MathInline tex="P" /> using Cauchy stress{' '}
            <MathInline tex="\sigma" /> and the stretch tensor:
          </p>
          <MathBlock tex="P = J \sigma U^{-T}" />
          <p>We apply a volumetric dashpot to stabilize the nearly incompressible solid. Look at figure 3 for squishy material.

          </p>

          <h2>6. Contact and Smashing</h2>
          <p>
            When two parts hit we need penalty stiffness and damping. We size the penalty stiffness{' '}
            <MathInline tex="k" /> from the continuum.
          </p>
          <p>
            For damping we use the Hunt-Crossley model in the form used by Flores. We floor the
            approach speed at <MathInline tex="0.1" /> m/s to prevent infinite damping when an
            object is at rest. The damping factor <MathInline tex="D" /> with restitution{' '}
            <MathInline tex="e" /> is:
          </p>
          <MathBlock tex="D = \frac{8(1-e)}{5 e \, v^{-}}" />
          <p>
            Friction uses a regularized Coulomb law. It ramps up over a small stick speed to
            maintain stability.
          </p>
          <Figure
            src="/images/PhysicsEngine/GIFBallintoCube.gif"
            alt="A sphere driven into a cube on the arena grid."
            width={1920}
            height={916}
            caption="Figure 4. Sphere launched at cube."
          />

          <h2>7. Welds and Heat Transfer</h2>
          <p>
            Welds tie nodes together at zero rest length. They can fail under shear and peel stress.
          </p>
          <p>
            Heat is updated explicitly. Nodes pass heat to neighbors based on thermal capacity and
            conductance. Radiation from a torch or weapon uses the Stefan-Boltzmann constant{' '}
            <MathInline tex="\sigma" />. The unit for this constant must use a capital{' '}
            <MathInline tex="K" /> for Kelvin. I had a lowercase <MathInline tex="k" /> before but
            that was just not cool.
          </p>
          <MathBlock tex="\sigma = 5.670374419 \times 10^{-8}\,\mathrm{W}\cdot\mathrm{m}^{-2}\cdot\mathrm{K}^{-4}" />
          <p>
            The heat flux <MathInline tex="q" /> is calculated with a view factor and the
            temperature difference to the fourth power.
          </p>
          <Figure
            src="/images/PhysicsEngine/ShowHeatSource.png"
            alt="An orange heat source held against the face of a blue cube."
            width={984}
            height={825}
            caption="Figure 5. A heat source on the hollow cube."
          />
          <Figure
            src="/images/PhysicsEngine/ShowTemp.png"
            alt="The cube coloured by temperature, hot yellow on the heated face and cool blue on the far side, with a readout of 796.3 K."
            width={931}
            height={885}
            caption="Figure 6. Temperature over time on the hollow cube."
          />
          <Figure
            src="/images/PhysicsEngine/ShowStressForTemp.png"
            alt="The same cube coloured by stress, with red and orange where the temperature gradient is steepest."
            width={900}
            height={873}
            caption="Figure 7. Stress on the hollow cube, from the temperature difference."
          />

          <h2>Lab Data Comparison</h2>
          <p>
            Building the math is one thing but proving it works is another. I took standard
            laboratory stress tests used in mechanical engineering and recreated them inside my
            simulation to the best of my ability. I compared my program&apos;s outputs to standard reference properties. This proves the months I spent writing this solver
            actually produced something.
          </p>
          <p>Here is the raw data I logged from the simulation compared to the expected theoretical numbers.</p>

          <div className="my-8 overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Simulated lab results compared with theoretical and handbook targets, with the quantity each number measures
              </caption>
              <thead>
                <tr className="border-b border-white/15 text-[var(--primary-dark)]">
                  <th className="py-2 pr-4 font-semibold">Test Type</th>
                  <th className="py-2 pr-4 font-semibold">Material</th>
                  <th className="py-2 pr-4 font-semibold">What we are measuring</th>
                  <th className="py-2 pr-4 font-semibold">Simulated Result</th>
                  <th className="py-2 pr-4 font-semibold">Real / Theoretical Target</th>
                  <th className="py-2 pr-4 font-semibold">Error</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {LAB_ROWS.map((row) => (
                  <tr key={row.join('|')} className="border-b border-white/10">
                    {row.map((cell) => (
                      <td key={cell} className="py-2 pr-4 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-display mt-10 mb-3 text-xl font-bold text-[var(--primary-dark)]">
            The Good Data
          </h3>
          <ul>
            <li>
              <strong>Basic Motion and Kinematics:</strong> Testing free fall and sliding blocks
              against standard Newtonian equations yielded an error of less than 1 percent. A
              resting block also does not magically skate around on the floor which is a common
              glitch in bad physics engines.
            </li>
            <li>
              <strong>Elastic Regions for Metals:</strong> I simulated tension tests at 30 percent
              yield for Aluminum 6061-T6, A36 Mild Steel, and AR500 Steel. The solver calculated the
              Young&apos;s Modulus and Poisson&apos;s ratio perfectly. They stayed within a 3 to 4
              percent error margin of standard handbook data.
            </li>
            <li>
              <strong>Shear Modulus:</strong> The simulated shear plate for Aluminum calculated a
              shear modulus of <MathInline tex="23.32" /> GPa compared to the handbook{' '}
              <MathInline tex="25.90" /> GPa. A 10 percent error is highly acceptable for a real
              time discrete solver.
            </li>
            <li>
              <strong>Rubber Rebound:</strong> Simulating an aluminum block striking an elastomer
              pad gave an energy ratio of 4.3 percent. This matches very well with what you would
              expect from a physical Bayshore resilience pendulum test on filled rubbers.
            </li>
          </ul>

          <h3 className="font-display mt-10 mb-3 text-xl font-bold text-[var(--primary-dark)]">
            The Bad Data
          </h3>
          <p>
            My engine is not perfect yet. There is data that is clearly wrong due to unresolved
            issues with how the matrix factorizations handle extreme topological changes.
          </p>
          <ul>
            <li>
              <strong>Ductile Yield Divergence:</strong> When testing metals past their yield load
              the solver simply diverges. It leaves the real line and crashes. The math currently
              struggles to stay finite during heavy plastic deformation.
            </li>
            <li>
              <strong>Brittle Shattering Fails:</strong> The brittle physics are currently broken. A
              glass flexure test failed to reach the intended stress to cause a crack. Crush and
              punch tests on soda-lime glass completely diverged without logging a single crack. The
              solver cannot handle the sudden infinite stress spikes when brittle elements get
              crushed.
            </li>
            <li>
              <strong>Charpy Impact Inaccuracies:</strong> The Charpy analog test for 6061-T6
              returned an absorbed work of <MathInline tex="5.37" /> J. Real world handbook data
              puts this between 10 and 40 J. However this is likely because my test just pushed a
              force on a node instead of simulating an actual swinging mass pendulum. This is a
              problem that I may fix... in the future.
            </li>
            <li>
              <strong>Rubber Limits:</strong> The Mooney-Rivlin hyperelastic law works well at small
              strains but the rubber test did not reach the proper tear stretch. It also failed to
              register residual set after a compression test because my current hyperelastic code
              lacks a compression set mechanism entirely.
            </li>
          </ul>

          <h2>Conclusion</h2>
          <p>
            I learned lots of materials science and mechanical engineering through this project. 
            I had to research how ductile, brittle, and compliant materials actually fail under 
            extreme conditions. I learned about strain rates, stress triaxiality, hyperelasticity, 
            and sparse linear solvers. I also learnt a lot about what not to do to keep your sanity.
          </p>
          <p>
            Running those lab comparisons proved that something actually works.
            Seeing the elastic region of aluminum match real world engineering handbooks within 3
            percent was all I needed to know that it was good enough to call it complete. I also learned exactly why everyone does not just make
            their own physics engine. It is incredibly difficult. You are constantly fighting
            mathematical instability and running tests that just take forever since this simulation
            is in series. Unlike the n-body problem, the physics engine is not parallelizable.
          </p>
          <p>
            My original goal was to create a physics engine that could be used to simulate CAD model durability.
            I have not accomplished this goal, but this is like one of those "Aim for the stars and you'll fall
            on the tree tops" kind of situations. Atleast, I am not on the ground anymore.
          </p>
          <Figure
            src="/images/PhysicsEngine/GIFBallLandBall.gif"
            alt="A sphere landing in the arena, with the stress colour scale in the corner."
            width={800}
            height={419}
            caption="Figure 8. Two balls, one collision. Many implications."
          />
          <p>*Physics Engine is realistic in some world parallel to us.</p>
          <h2>References</h2>
          <p className="text-sm text-[var(--primary-light)]">
            These pages helped a lot with researching for this project. Also fun to read.
          </p>
          <ul>
            <li>
              <a href="https://www.matweb.com" target="_blank" rel="noopener noreferrer">
                MatWeb Material Property Data
              </a>{' '}
              — MatWeb
            </li>
            <li>
              <a
                href="https://api.projectchrono.org/manual_fea.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Finite Element Analysis
              </a>{' '}
              — Project Chrono
            </li>
            <li>
              <a
                href="https://www.doitpoms.ac.uk/tlplib/mechanical_testing_metals/necking.php"
                target="_blank"
                rel="noopener noreferrer"
              >
                Necking
              </a>{' '}
              — DoITPoMS, University of Cambridge
            </li>
            <li>
              <a
                href="https://doi.org/10.1007/s11044-010-9237-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                On the continuous contact force models for soft materials in multibody dynamics
              </a>{' '}
              — Flores, P., et al., Multibody System Dynamics, 2011
            </li>
            <li>
              <a
                href="https://ocw.mit.edu/courses/3-225-electronic-and-mechanical-properties-of-materials-fall-2007/resources/m2005/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Electronic and Mechanical Properties of Materials
              </a>{' '}
              — MIT OpenCourseWare, 3.225, Fall 2007
            </li>
          </ul>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
          >
            <ArrowLeft size={16} />
            Back to the project
          </Link>
        </div>
      </article>
    </div>
  )
}
