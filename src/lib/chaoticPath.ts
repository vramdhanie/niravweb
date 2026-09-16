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
  for (let i = 1; i <= 20; i++) {
    const t = i / 21
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

function landingFrom(from: Pt, b: Box): { end: Pt; outward: Pt } {
  const inset = 6
  const left = b.x
  const right = b.x + b.width
  const top = b.y
  const bottom = b.y + b.height
  const xOn = from.x >= left && from.x <= right
  const yOn = from.y >= top && from.y <= bottom

  if (!xOn && yOn) {
    if (from.x < left) {
      return { end: { x: left, y: clamp(from.y, top + inset, bottom - inset) }, outward: { x: -1, y: 0 } }
    }
    return { end: { x: right, y: clamp(from.y, top + inset, bottom - inset) }, outward: { x: 1, y: 0 } }
  }
  if (xOn && !yOn) {
    if (from.y < top) {
      return { end: { x: clamp(from.x, left + inset, right - inset), y: top }, outward: { x: 0, y: -1 } }
    }
    return { end: { x: clamp(from.x, left + inset, right - inset), y: bottom }, outward: { x: 0, y: 1 } }
  }
  if (!xOn && !yOn) {
    const dL = Math.abs(from.x - left)
    const dR = Math.abs(from.x - right)
    const dT = Math.abs(from.y - top)
    const dB = Math.abs(from.y - bottom)
    const cornerX = dL < dR ? left : right
    const cornerY = dT < dB ? top : bottom
    if (Math.min(dL, dR) <= Math.min(dT, dB)) {
      return {
        end: { x: cornerX, y: clamp(cornerY === top ? top + inset : bottom - inset, top + inset, bottom - inset) },
        outward: { x: cornerX === left ? -1 : 1, y: 0 },
      }
    }
    return {
      end: { x: clamp(cornerX === left ? left + inset : right - inset, left + inset, right - inset), y: cornerY },
      outward: { x: 0, y: cornerY === top ? -1 : 1 },
    }
  }

  const dL = from.x - left
  const dR = right - from.x
  const dT = from.y - top
  const dB = bottom - from.y
  const m = Math.min(dL, dR, dT, dB)
  if (m === dL) return { end: { x: left, y: clamp(from.y, top + inset, bottom - inset) }, outward: { x: -1, y: 0 } }
  if (m === dR) return { end: { x: right, y: clamp(from.y, top + inset, bottom - inset) }, outward: { x: 1, y: 0 } }
  if (m === dT) return { end: { x: clamp(from.x, left + inset, right - inset), y: top }, outward: { x: 0, y: -1 } }
  return { end: { x: clamp(from.x, left + inset, right - inset), y: bottom }, outward: { x: 0, y: 1 } }
}

function appendSmoothLanding(
  d: string,
  prev: Pt,
  prevTan: Pt | null,
  avoid: Box,
  bounds: Box,
  pad: number
): string {
  const { end, outward } = landingFrom(prev, avoid)
  const tan = unit(prevTan ?? { x: end.x - prev.x, y: end.y - prev.y })
  const inward = { x: -outward.x, y: -outward.y }
  const chord = Math.max(dist(prev, end), 1)
  const k = clamp(chord * 0.45, 48, 180)

  let arrive = unit(add(scale(tan, 0.72), scale(inward, 0.28)))
  if (arrive.x * tan.x + arrive.y * tan.y < 0.15) {
    arrive = tan
  }

  let c1 = add(prev, scale(tan, k))
  let c2 = add(end, scale(arrive, -k))
  if (!cubicCutsInterior(prev, c1, c2, end, avoid)) {
    return d + cubic(c1, c2, end)
  }

  const centre = boxCentre(avoid)
  const away = unit({ x: (prev.x + end.x) / 2 - centre.x, y: (prev.y + end.y) / 2 - centre.y })
  const mid = clampOutside(
    {
      x: (prev.x + end.x) / 2 + away.x * clamp(chord * 0.22, 28, 64),
      y: (prev.y + end.y) / 2 + away.y * clamp(chord * 0.22, 28, 64),
    },
    bounds,
    pad,
    avoid,
    16
  )
  const midTan = unit(add(tan, unit({ x: end.x - prev.x, y: end.y - prev.y })))
  const k1 = handleLen(prev, mid, 48)
  const k2 = handleLen(mid, end, 48)
  c1 = add(prev, scale(tan, k1))
  const cJoinIn = add(mid, scale(midTan, -k1))
  const cJoinOut = add(mid, scale(midTan, k2))
  c2 = add(end, scale(unit(add(scale(midTan, 0.6), scale(inward, 0.4))), -k2))
  if (!cubicCutsInterior(prev, c1, cJoinIn, mid, avoid) && !cubicCutsInterior(mid, cJoinOut, c2, end, avoid)) {
    return d + cubic(c1, cJoinIn, mid) + cubic(cJoinOut, c2, end)
  }

  const hover = clampOutside(
    { x: end.x + outward.x * 36, y: end.y + outward.y * 36 },
    bounds,
    pad,
    avoid,
    12
  )
  const kh = handleLen(prev, hover, 48)
  const ke = handleLen(hover, end, 48)
  const hoverTan = unit({ x: -outward.x, y: -outward.y })
  return (
    d +
    cubic(add(prev, scale(tan, kh)), add(hover, scale(hoverTan, -kh)), hover) +
    cubic(add(hover, scale(hoverTan, ke)), add(end, scale(hoverTan, -ke)), end)
  )
}

function clampOutside(p: Pt, bounds: Box, pad: number, avoid: Box, gap: number): Pt {
  let x = clamp(p.x, bounds.x + pad, bounds.x + bounds.width - pad)
  let y = clamp(p.y, bounds.y + pad, bounds.y + bounds.height - pad)
  if (inInterior({ x, y }, inflate(avoid, gap), 0)) {
    const { end, outward } = landingFrom({ x, y }, avoid)
    x = end.x + outward.x * (gap + 8)
    y = end.y + outward.y * (gap + 8)
    x = clamp(x, bounds.x + pad, bounds.x + bounds.width - pad)
    y = clamp(y, bounds.y + pad, bounds.y + bounds.height - pad)
  }
  return { x, y }
}

function buildOrbitPath(start: Pt, bounds: Box, mode: PathMode, avoid: Box): string {
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
  let prevTan: Pt | null = null

  if (pivots.length === 0) {
    return appendSmoothLanding(d, start, null, avoid, bounds, pad)
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

  return appendSmoothLanding(d, prev, prevTan, avoid, bounds, pad)
}

export function generateChaoticPath(opts: {
  start: Pt
  bounds: Box
  avoid: Box
  mode: PathMode
}): string {
  return buildOrbitPath(opts.start, opts.bounds, opts.mode, opts.avoid)
}
