export type Pt = { x: number; y: number }
export type Box = { x: number; y: number; width: number; height: number }

export function boxCentre(b: Box): Pt {
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export function pointBelow(b: Box, gap = 10): Pt {
  return { x: b.x + b.width / 2, y: b.y + b.height + gap }
}

export type Ellipse = { cx: number; cy: number; rx: number; ry: number }

/** Axis-aligned ellipse that loosely circles a text box. */
export function ellipseAround(b: Box, padX = 14, padY = 10): Ellipse {
  return {
    cx: b.x + b.width / 2,
    cy: b.y + b.height / 2,
    rx: Math.max(b.width / 2 + padX, 28),
    ry: Math.max(b.height / 2 + padY, 14),
  }
}

/** Random point on the ellipse, leaving along the outward normal. */
export function randomPerpFromEllipse(e: Ellipse): { start: Pt; tangent: Pt } {
  const theta = Math.random() * Math.PI * 2
  const start = {
    x: e.cx + e.rx * Math.cos(theta),
    y: e.cy + e.ry * Math.sin(theta),
  }
  const n = unit({
    x: (start.x - e.cx) / (e.rx * e.rx),
    y: (start.y - e.cy) / (e.ry * e.ry),
  })
  return { start, tangent: n }
}

function dist(a: Pt, b: Pt) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function add(a: Pt, b: Pt): Pt {
  return { x: a.x + b.x, y: a.y + b.y }
}

function scale(a: Pt, s: number): Pt {
  return { x: a.x * s, y: a.y * s }
}

function polar(c: Pt, r: number, a: number): Pt {
  return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) }
}

/** Unit tangent for a circle (y-down): increasing angle is clockwise. */
function orbitTangent(a: number, dir: 1 | -1): Pt {
  return { x: -Math.sin(a) * dir, y: Math.cos(a) * dir }
}

function inflate(b: Box, p: number): Box {
  return { x: b.x - p, y: b.y - p, width: b.width + 2 * p, height: b.height + 2 * p }
}

function distToBox(p: Pt, b: Box) {
  const cx = clamp(p.x, b.x, b.x + b.width)
  const cy = clamp(p.y, b.y, b.y + b.height)
  const inside =
    p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height
  if (inside) return 0
  return Math.hypot(p.x - cx, p.y - cy)
}

function inInterior(p: Pt, b: Box, inset = 2) {
  return (
    p.x > b.x + inset &&
    p.x < b.x + b.width - inset &&
    p.y > b.y + inset &&
    p.y < b.y + b.height - inset
  )
}

function unit(p: Pt): Pt {
  const n = Math.hypot(p.x, p.y)
  if (n < 1e-6) return { x: 1, y: 0 }
  return { x: p.x / n, y: p.y / n }
}

function cubic(c1: Pt, c2: Pt, p: Pt) {
  return ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
}

function arc(r: number, delta: number, dir: 1 | -1, end: Pt) {
  const large = Math.abs(delta) > Math.PI ? 1 : 0
  const sweep = dir > 0 ? 1 : 0
  return ` A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} ${sweep} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`
}

export type PathMode = 'hero' | 'read'

type Pivot = { c: Pt; r: number; dir: 1 | -1; a0: number; a1: number }

function pickPivot(
  bounds: Box,
  avoid: Box | undefined,
  rMin: number,
  rMax: number,
  pad: number
): { c: Pt; r: number } | null {
  const forbidden = avoid ? inflate(avoid, 14) : null
  for (let i = 0; i < 40; i++) {
    const r = rand(rMin, rMax)
    const c = {
      x: rand(bounds.x + pad + r, bounds.x + bounds.width - pad - r),
      y: rand(bounds.y + pad + r, bounds.y + bounds.height - pad - r),
    }
    if (c.x < bounds.x + pad + r || c.y < bounds.y + pad + r) continue
    if (forbidden && distToBox(c, forbidden) < r + 12) continue
    return { c, r }
  }
  return null
}

function handleLen(a: Pt, b: Pt, r: number) {
  return clamp(dist(a, b) * 0.38, r * 0.3, r * 0.9)
}

function cubicCutsInterior(p0: Pt, c1: Pt, c2: Pt, p3: Pt, box: Box) {
  for (let i = 1; i <= 32; i++) {
    const t = i / 33
    const u = 1 - t
    const p = {
      x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
    }
    if (inInterior(p, box, 1)) return true
  }
  return false
}

function arcCutsInterior(c: Pt, r: number, a0: number, a1: number, box: Box) {
  const delta = a1 - a0
  for (let i = 0; i <= 24; i++) {
    const p = polar(c, r, a0 + (delta * i) / 24)
    if (inInterior(p, box, 1)) return true
  }
  return false
}

/** Random point on one edge, inset from the corners. */
function landingOnEdge(b: Box, edge: number): { end: Pt; outward: Pt } {
  const inset = 6
  const left = b.x
  const right = b.x + b.width
  const top = b.y
  const bottom = b.y + b.height
  const xSpan = Math.max(right - left - 2 * inset, 0)
  const ySpan = Math.max(bottom - top - 2 * inset, 0)
  if (edge === 0) {
    return { end: { x: left + inset + Math.random() * xSpan, y: top }, outward: { x: 0, y: -1 } }
  }
  if (edge === 1) {
    return { end: { x: right, y: top + inset + Math.random() * ySpan }, outward: { x: 1, y: 0 } }
  }
  if (edge === 2) {
    return { end: { x: left + inset + Math.random() * xSpan, y: bottom }, outward: { x: 0, y: 1 } }
  }
  return { end: { x: left, y: top + inset + Math.random() * ySpan }, outward: { x: -1, y: 0 } }
}

function shuffledEdges(): number[] {
  const e = [0, 1, 2, 3]
  for (let i = e.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[e[i], e[j]] = [e[j], e[i]]
  }
  return e
}

/**
 * Circle through P and E whose tangent at P is T.
 * dir +1 follows increasing angle (clockwise on a y-down canvas), matching `arc()`.
 */
function fitArc(
  P: Pt,
  T: Pt,
  E: Pt,
  dir: 1 | -1
): { c: Pt; r: number; a0: number; a1: number } | null {
  const tan = unit(T)
  const N = dir === 1 ? { x: -tan.y, y: tan.x } : { x: tan.y, y: -tan.x }
  const qx = P.x - E.x
  const qy = P.y - E.y
  const den = 2 * (qx * N.x + qy * N.y)
  if (Math.abs(den) < 1e-4) return null
  const r = -(qx * qx + qy * qy) / den
  if (r < 40 || r > 420) return null
  const c = { x: P.x + N.x * r, y: P.y + N.y * r }
  const a0 = Math.atan2(P.y - c.y, P.x - c.x)
  let a1 = Math.atan2(E.y - c.y, E.x - c.x)
  if (dir === 1) {
    while (a1 <= a0 + 1e-4) a1 += Math.PI * 2
  } else {
    while (a1 >= a0 - 1e-4) a1 -= Math.PI * 2
  }
  const delta = a1 - a0
  if (Math.abs(delta) < 0.12 || Math.abs(delta) > Math.PI * 0.95) return null
  return { c, r, a0, a1 }
}

function rotate(p: Pt, rad: number): Pt {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
}

/** ±30° from the inward normal — 60° to 120° from the edge. */
const APPROACH_HALF = Math.PI / 6

function inApproachCone(arrive: Pt, outward: Pt) {
  const a = unit(arrive)
  return a.x * -outward.x + a.y * -outward.y >= Math.cos(APPROACH_HALF)
}

function randomApproach(outward: Pt): Pt {
  return rotate({ x: -outward.x, y: -outward.y }, (Math.random() * 2 - 1) * APPROACH_HALF)
}

function landingArcOk(
  fitted: { c: Pt; r: number; a0: number; a1: number },
  dir: 1 | -1,
  end: Pt,
  outward: Pt,
  avoid: Box
) {
  if (arcCutsInterior(fitted.c, fitted.r, fitted.a0, fitted.a1, avoid)) return false
  const before = polar(fitted.c, fitted.r, fitted.a1 - Math.sign(fitted.a1 - fitted.a0) * 0.1)
  if ((before.x - end.x) * outward.x + (before.y - end.y) * outward.y <= 1.5) return false
  return inApproachCone(orbitTangent(fitted.a1, dir), outward)
}

function tryLandingArc(from: Pt, tan: Pt, end: Pt, outward: Pt, avoid: Box) {
  for (const dir of [1, -1] as const) {
    const fitted = fitArc(from, tan, end, dir)
    if (!fitted) continue
    if (!landingArcOk(fitted, dir, end, outward, avoid)) continue
    return arc(fitted.r, fitted.a1 - fitted.a0, dir, end)
  }
  return null
}

function landingArcs(prev: Pt, tan: Pt, end: Pt, outward: Pt, avoid: Box): string | null {
  const direct = tryLandingArc(prev, tan, end, outward, avoid)
  if (direct) return direct

  for (const dir of [1, -1] as const) {
    const N = dir === 1 ? { x: -tan.y, y: tan.x } : { x: tan.y, y: -tan.x }
    for (const r of [50, 72, 96, 130, 170]) {
      const c = add(prev, scale(N, r))
      const a0 = Math.atan2(prev.y - c.y, prev.x - c.x)
      for (const sweep of [0.4, 0.7, 1.05, 1.4]) {
        const a1 = a0 + sweep * (dir === 1 ? 1 : -1)
        if (arcCutsInterior(c, r, a0, a1, avoid)) continue
        const mid = polar(c, r, a1)
        if (inInterior(mid, inflate(avoid, 14), 0)) continue
        const rest = tryLandingArc(mid, orbitTangent(a1, dir), end, outward, avoid)
        if (rest) return arc(r, a1 - a0, dir, mid) + rest
      }
    }
  }
  return null
}

/** Last segment rides a ray in the 60–120° cone; the join to it stays G1. */
function approachInCone(prev: Pt, tan: Pt, end: Pt, outward: Pt, avoid: Box): string | null {
  const arrive = randomApproach(outward)
  for (const dist of [56, 80, 110, 150, 200, 260]) {
    const hover = { x: end.x - arrive.x * dist, y: end.y - arrive.y * dist }
    if (inInterior(hover, inflate(avoid, 16), 0)) continue
    const kOut = clamp(dist * 0.38, 20, dist * 0.48)
    const cJoinOut = add(hover, scale(arrive, kOut))
    const cEnd = add(end, scale(arrive, -kOut))
    if (cubicCutsInterior(hover, cJoinOut, cEnd, end, avoid)) continue

    const kh = handleLen(prev, hover, 72)
    const c1 = add(prev, scale(tan, kh))
    const cJoinIn = add(hover, scale(arrive, -kh))
    if (cubicCutsInterior(prev, c1, cJoinIn, hover, avoid)) continue
    return cubic(c1, cJoinIn, hover) + cubic(cJoinOut, cEnd, end)
  }
  return null
}

function appendSmoothLanding(
  d: string,
  prev: Pt,
  prevTan: Pt | null,
  avoid: Box
): string {
  const tan = unit(prevTan ?? { x: 1, y: 0 })
  for (const edge of shuffledEdges()) {
    const { end, outward } = landingOnEdge(avoid, edge)
    const arcs = landingArcs(prev, tan, end, outward, avoid)
    if (arcs) return d + arcs
  }
  for (const edge of shuffledEdges()) {
    const { end, outward } = landingOnEdge(avoid, edge)
    const cone = approachInCone(prev, tan, end, outward, avoid)
    if (cone) return d + cone
  }

  const { end, outward } = landingOnEdge(avoid, shuffledEdges()[0])
  const arrive = randomApproach(outward)
  const k = handleLen(prev, end, 72)
  const c1 = add(prev, scale(tan, k))
  const c2 = add(end, scale(arrive, -k))
  if (!cubicCutsInterior(prev, c1, c2, end, avoid)) return d + cubic(c1, c2, end)

  const hover = { x: end.x - arrive.x * 90, y: end.y - arrive.y * 90 }
  const k1 = handleLen(prev, hover, 72)
  const k2 = handleLen(hover, end, 72)
  return (
    d +
    cubic(add(prev, scale(tan, k1)), add(hover, scale(arrive, -k1)), hover) +
    cubic(add(hover, scale(arrive, k2)), add(end, scale(arrive, -k2)), end)
  )
}

function buildOrbitPath(start: Pt, bounds: Box, mode: PathMode, avoid: Box, startTan?: Pt): string {
  const pad = 18
  const minDim = Math.min(bounds.width, bounds.height)
  const nPivots =
    mode === 'hero' ? (Math.random() < 0.35 ? 1 : 2) : Math.random() < 0.4 ? 2 : 3
  const rMin = minDim * (mode === 'hero' ? 0.07 : 0.08)
  const rMax = minDim * (mode === 'hero' ? 0.18 : 0.2)

  const pivots: Pivot[] = []
  for (let i = 0; i < nPivots; i++) {
    const picked = pickPivot(bounds, avoid, rMin, rMax, pad)
    if (!picked) continue
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1
    const a0 = rand(0, Math.PI * 2)
    const sweep = rand(Math.PI * 0.7, Math.PI * 1.65) * dir
    if (arcCutsInterior(picked.c, picked.r, a0, a0 + sweep, avoid)) continue
    pivots.push({ c: picked.c, r: picked.r, dir, a0, a1: a0 + sweep })
  }

  let d = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`
  let prev = start
  let prevTan: Pt | null = startTan ? unit(startTan) : null

  if (pivots.length === 0) {
    return appendSmoothLanding(d, start, prevTan, avoid)
  }

  for (const pivot of pivots) {
    let entry = polar(pivot.c, pivot.r, pivot.a0)
    let tanIn = orbitTangent(pivot.a0, pivot.dir)
    let kIn = handleLen(prev, entry, pivot.r)
    let c1 = prevTan
      ? add(prev, scale(prevTan, kIn))
      : add(prev, scale({ x: entry.x - prev.x, y: entry.y - prev.y }, 0.38))
    let c2 = add(entry, scale(tanIn, -kIn))

    for (let tryA = 0; tryA < 12 && cubicCutsInterior(prev, c1, c2, entry, avoid); tryA++) {
      pivot.a0 += 0.5
      pivot.a1 += 0.5
      entry = polar(pivot.c, pivot.r, pivot.a0)
      tanIn = orbitTangent(pivot.a0, pivot.dir)
      kIn = handleLen(prev, entry, pivot.r)
      c1 = prevTan
        ? add(prev, scale(prevTan, kIn))
        : add(prev, scale({ x: entry.x - prev.x, y: entry.y - prev.y }, 0.38))
      c2 = add(entry, scale(tanIn, -kIn))
    }

    d += cubic(c1, c2, entry)
    const exit = polar(pivot.c, pivot.r, pivot.a1)
    d += arc(pivot.r, pivot.a1 - pivot.a0, pivot.dir, exit)
    prev = exit
    prevTan = orbitTangent(pivot.a1, pivot.dir)
  }

  return appendSmoothLanding(d, prev, prevTan, avoid)
}

export function generateChaoticPath(opts: {
  start: Pt
  bounds: Box
  avoid: Box
  mode: PathMode
  startTan?: Pt
}): string {
  return buildOrbitPath(opts.start, opts.bounds, opts.mode, opts.avoid, opts.startTan)
}
