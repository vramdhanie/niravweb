'use client'

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { ellipseAround, type Ellipse } from '@/lib/chaoticPath'

const ARROW = '#f4d020'
const RING = 'rgb(24, 118, 158)'

const RADIUS = 5
const LAUNCH_SPEED = 1120
const GRAVITY = 1300
const RESTITUTION = 0.94
const DRAG = 0.15
const FRICTION = 420
const SETTLE_SPEED = 52
const SETTLE_TIME = 0.4
const WAIT_MS = 3000
const HOME_SPEED = 380
const STEP = 0.005
const EXPLOSION_PLAY_MS = 1210
const EXPLOSION_PLAYS = 2

type Rect = { x: number; y: number; w: number; h: number }
type V = { x: number; y: number }

interface Props {
  sectionRef: RefObject<HTMLElement | null>
  hereRef: RefObject<HTMLElement | null>
  articleRef: RefObject<HTMLElement | null>
  githubRef: RefObject<HTMLElement | null>
}

function Explosion({ x, y }: { x: number; y: number }) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setGone(true), EXPLOSION_PLAY_MS * EXPLOSION_PLAYS)
    return () => window.clearTimeout(id)
  }, [])

  if (gone) return null

  return (
    <img
      src="/images/Explosion.gif"
      alt=""
      width={142}
      height={200}
      className="pointer-events-none absolute z-[4] mix-blend-screen"
      style={{ left: x - 71, top: y - 100 }}
    />
  )
}

function localRect(el: HTMLElement, section: DOMRect): Rect {
  const r = el.getBoundingClientRect()
  return { x: r.left - section.left, y: r.top - section.top, w: r.width, h: r.height }
}

function speed(v: V) {
  return Math.hypot(v.x, v.y)
}

function hitRect(p: V, box: Rect, radius: number) {
  const cx = Math.max(box.x, Math.min(p.x, box.x + box.w))
  const cy = Math.max(box.y, Math.min(p.y, box.y + box.h))
  const dx = p.x - cx
  const dy = p.y - cy
  if (dx === 0 && dy === 0) return { inside: true as const, nx: 0, ny: 0, dist: 0 }
  const dist = Math.hypot(dx, dy)
  if (dist > radius) return null
  return { inside: false as const, nx: dx / dist, ny: dy / dist, dist }
}

function pushOut(p: V, box: Rect, radius: number) {
  const left = p.x - box.x
  const right = box.x + box.w - p.x
  const top = p.y - box.y
  const bottom = box.y + box.h - p.y
  const m = Math.min(left, right, top, bottom)
  if (m === left) return { x: box.x - radius, y: p.y, nx: -1, ny: 0 }
  if (m === right) return { x: box.x + box.w + radius, y: p.y, nx: 1, ny: 0 }
  if (m === top) return { x: p.x, y: box.y - radius, nx: 0, ny: -1 }
  return { x: p.x, y: box.y + box.h + radius, nx: 0, ny: 1 }
}

function scrub(v: V, h: number) {
  const cut = FRICTION * h
  if (Math.abs(v.x) <= cut) v.x = 0
  else v.x -= Math.sign(v.x) * cut
}

function onTopOf(p: V, box: Rect) {
  return (
    p.y <= box.y - RADIUS + 1.5 &&
    p.y >= box.y - RADIUS - 3 &&
    p.x >= box.x - RADIUS &&
    p.x <= box.x + box.w + RADIUS
  )
}

function bounce(p: V, v: V, box: Rect) {
  const hit = hitRect(p, box, RADIUS)
  if (!hit) return false
  let nx = hit.nx
  let ny = hit.ny
  if (hit.inside) {
    const out = pushOut(p, box, RADIUS)
    p.x = out.x
    p.y = out.y
    nx = out.nx
    ny = out.ny
  } else {
    p.x += nx * (RADIUS - hit.dist)
    p.y += ny * (RADIUS - hit.dist)
  }
  const vn = v.x * nx + v.y * ny
  if (vn < 0) {
    v.x -= (1 + RESTITUTION) * vn * nx
    v.y -= (1 + RESTITUTION) * vn * ny
  }
  return true
}

export default function HeroArrow({ sectionRef, hereRef, articleRef, githubRef }: Props) {
  const trailRef = useRef<SVGPolylineElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const stemRef = useRef<SVGLineElement>(null)
  const gradRef = useRef<SVGLinearGradientElement>(null)
  const geom = useRef({
    points: '',
    transform: 'translate(-9999 -9999)',
    stem: null as { x1: number; y1: number; x2: number; y2: number } | null,
  })
  const [ellipse, setEllipse] = useState<Ellipse | null>(null)
  const [boom, setBoom] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    const g = geom.current
    trailRef.current?.setAttribute('points', g.points)
    headRef.current?.setAttribute('transform', g.transform)
    if (stemRef.current && gradRef.current) {
      if (g.stem) {
        stemRef.current.style.display = ''
        stemRef.current.setAttribute('x1', g.stem.x1.toFixed(1))
        stemRef.current.setAttribute('y1', g.stem.y1.toFixed(1))
        stemRef.current.setAttribute('x2', g.stem.x2.toFixed(1))
        stemRef.current.setAttribute('y2', g.stem.y2.toFixed(1))
        gradRef.current.setAttribute('x1', g.stem.x1.toFixed(1))
        gradRef.current.setAttribute('y1', g.stem.y1.toFixed(1))
        gradRef.current.setAttribute('x2', g.stem.x2.toFixed(1))
        gradRef.current.setAttribute('y2', g.stem.y2.toFixed(1))
      } else {
        stemRef.current.style.display = 'none'
      }
    }
  })

  useEffect(() => {
    const section = sectionRef.current
    const here = hereRef.current
    const article = articleRef.current
    const github = githubRef.current
    if (!section || !here || !article || !github) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let alive = true
    let raf = 0
    let resizeTimer = 0

    const paint = (x: number, y: number, angle: number) => {
      const deg = (angle * 180) / Math.PI
      const g = geom.current
      g.transform = `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${deg.toFixed(2)})`
      headRef.current?.setAttribute('transform', g.transform)
      trailRef.current?.setAttribute('points', g.points)
      if (stemRef.current && gradRef.current && g.stem) {
        stemRef.current.style.display = ''
        stemRef.current.setAttribute('x1', g.stem.x1.toFixed(1))
        stemRef.current.setAttribute('y1', g.stem.y1.toFixed(1))
        stemRef.current.setAttribute('x2', g.stem.x2.toFixed(1))
        stemRef.current.setAttribute('y2', g.stem.y2.toFixed(1))
        gradRef.current.setAttribute('x1', g.stem.x1.toFixed(1))
        gradRef.current.setAttribute('y1', g.stem.y1.toFixed(1))
        gradRef.current.setAttribute('x2', g.stem.x2.toFixed(1))
        gradRef.current.setAttribute('y2', g.stem.y2.toFixed(1))
      }
    }

    const launch = () => {
      if (!alive) return
      const sec = section.getBoundingClientRect()
      if (sec.width < 8 || sec.height < 8) return
      const word = here.getBoundingClientRect()
      const ring = ellipseAround({
        x: word.left - sec.left,
        y: word.top - sec.top,
        width: word.width,
        height: word.height,
      })
      setEllipse(ring)
      setBoom(null)
      if (reduce.matches) {
        geom.current = { points: '', transform: 'translate(-9999 -9999)', stem: null }
        paint(-9999, -9999, 0)
        return
      }

      // Up, plus or minus 90°, so the launch sits in the upper half-plane.
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
      const p = {
        x: ring.cx + ring.rx * Math.cos(angle),
        y: ring.cy + ring.ry * Math.sin(angle),
      }
      const v = { x: Math.cos(angle) * LAUNCH_SPEED, y: Math.sin(angle) * LAUNCH_SPEED }
      p.x = Math.min(sec.width - RADIUS, Math.max(RADIUS, p.x + v.x * 0.004))
      p.y = Math.min(sec.height - RADIUS, Math.max(RADIUS, p.y + v.y * 0.004))

      const pts: V[] = [{ x: p.x, y: p.y }]
      geom.current.points = `${p.x.toFixed(1)},${p.y.toFixed(1)}`
      geom.current.stem = null
      let stemLen = 0
      let mode: 'fly' | 'wait' | 'home' | 'done' = 'fly'
      let slow = 0
      let waitStarted = 0
      let last = performance.now()
      let facing = angle

      const stopOn = (box: Rect) => {
        const hit = hitRect(p, box, RADIUS)
        if (!hit) return false
        if (hit.inside) {
          const out = pushOut(p, box, RADIUS)
          p.x = out.x
          p.y = out.y
        } else {
          p.x += hit.nx * (RADIUS - hit.dist)
          p.y += hit.ny * (RADIUS - hit.dist)
        }
        v.x = 0
        v.y = 0
        mode = 'done'
        return true
      }

      const frame = (now: number) => {
        if (!alive) return
        const bounds = section.getBoundingClientRect()
        const articleBox = localRect(article, bounds)
        const githubBox = localRect(github, bounds)
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        if (mode === 'wait') {
          if (now - waitStarted >= WAIT_MS) {
            const tx = articleBox.x + articleBox.w / 2
            const ty = articleBox.y + articleBox.h / 2
            const dx = tx - p.x
            const dy = ty - p.y
            const n = Math.hypot(dx, dy) || 1
            v.x = (dx / n) * HOME_SPEED
            v.y = (dy / n) * HOME_SPEED
            facing = Math.atan2(v.y, v.x)
            mode = 'home'
          }
        }

        if (mode === 'fly' || mode === 'home') {
          const steps = Math.max(1, Math.ceil(dt / STEP))
          const h = dt / steps
          for (let i = 0; i < steps; i++) {
            if (mode === 'fly') {
              const onFloor = p.y >= bounds.height - RADIUS - 1
              const grounded = (onFloor || onTopOf(p, githubBox)) && Math.abs(v.y) < 180
              if (grounded) {
                v.y = 0
                if (onFloor) p.y = bounds.height - RADIUS
                scrub(v, h)
              } else {
                v.y += GRAVITY * h
                const damp = Math.exp(-DRAG * h)
                v.x *= damp
                v.y *= damp
              }
            }
            p.x += v.x * h
            p.y += v.y * h

            if (mode === 'fly') {
              if (p.x < RADIUS) {
                p.x = RADIUS
                if (v.x < 0) v.x = -v.x * RESTITUTION
              } else if (p.x > bounds.width - RADIUS) {
                p.x = bounds.width - RADIUS
                if (v.x > 0) v.x = -v.x * RESTITUTION
              }
              if (p.y < RADIUS) {
                p.y = RADIUS
                if (v.y < 0) v.y = -v.y * RESTITUTION
              } else if (p.y > bounds.height - RADIUS) {
                p.y = bounds.height - RADIUS
                if (v.y > 0) v.y = -v.y * RESTITUTION
              }
              bounce(p, v, githubBox)
              if (stopOn(articleBox)) break
              if (speed(v) < SETTLE_SPEED) slow += h
              else slow = 0
              if (slow >= SETTLE_TIME) {
                v.x = 0
                v.y = 0
                mode = 'wait'
                waitStarted = now
                break
              }
            } else if (stopOn(articleBox)) {
              break
            }

            const sp = speed(v)
            if (sp > 8) facing = Math.atan2(v.y, v.x)
            const lastPt = pts[pts.length - 1]
            if (Math.hypot(p.x - lastPt.x, p.y - lastPt.y) >= 4) {
              pts.push({ x: p.x, y: p.y })
              geom.current.points += ` ${p.x.toFixed(1)},${p.y.toFixed(1)}`
              if (!geom.current.stem) {
                stemLen += Math.hypot(p.x - lastPt.x, p.y - lastPt.y)
                if (stemLen >= 28) {
                  geom.current.stem = { x1: pts[0].x, y1: pts[0].y, x2: p.x, y2: p.y }
                }
              }
            }
          }
        }

        paint(p.x, p.y, facing)
        if (mode === 'done') {
          setBoom({ x: p.x, y: p.y })
          return
        }
        raf = requestAnimationFrame(frame)
      }

      paint(p.x, p.y, facing)
      raf = requestAnimationFrame(frame)
    }

    let seenW = -1
    let seenH = -1
    const onResize = () => {
      const r = section.getBoundingClientRect()
      if (Math.abs(r.width - seenW) < 2 && Math.abs(r.height - seenH) < 2) return
      seenW = r.width
      seenH = r.height
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        cancelAnimationFrame(raf)
        launch()
      }, 80)
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(section)
    return () => {
      alive = false
      window.clearTimeout(resizeTimer)
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [sectionRef, hereRef, articleRef, githubRef])

  return (
    <>
      <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-visible" aria-hidden>
        {ellipse ? (
          <ellipse
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            fill="none"
            stroke={RING}
            strokeWidth={2.1}
          />
        ) : null}
        <defs>
          <linearGradient ref={gradRef} id="hero-arrow-stem" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={RING} />
            <stop offset="50%" stopColor={RING} />
            <stop offset="100%" stopColor={ARROW} />
          </linearGradient>
        </defs>
        <polyline
          ref={trailRef}
          fill="none"
          stroke={ARROW}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          ref={stemRef}
          stroke="url(#hero-arrow-stem)"
          strokeWidth={2.6}
          strokeLinecap="round"
          style={{ display: 'none' }}
        />
        <g ref={headRef} transform="translate(-9999 -9999)">
          <path
            d="M -13 -8.5 L 0 0 L -13 8.5"
            fill="none"
            stroke={ARROW}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      {boom ? <Explosion x={boom.x} y={boom.y} /> : null}
    </>
  )
}
