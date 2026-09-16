export const ASTEROID_SIZE = 32
export const ASTEROID_RADIUS = 14
export const ASTEROID_MAX = 16
export const ASTEROID_SPRITE = '/images/nbody/asteroid.png'

export type AABB = { x: number; y: number; width: number; height: number }

export type Rock = {
  id: number
  x: number
  y: number
  px: number
  py: number
  vx: number
  vy: number
  angle: number
  spin: number
  born: number
  held: boolean
}

const DRAG = 0.72
const REST_WALL = 0.68
const REST_BALL = 0.8
const REST_HELD = 1.05
const MIN_KNOCK = 260
const STOP_SPEED = 12
const SPIN_DAMP = 1.2
const MAX_SPEED = 2800
const MAX_SPIN = 22

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

export function createRock(id: number, x: number, y: number): Rock {
  return {
    id,
    x,
    y,
    px: x,
    py: y,
    vx: 0,
    vy: 0,
    angle: Math.random() * Math.PI * 2,
    spin: 0,
    born: performance.now(),
    held: false,
  }
}

export function isInteractive(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('a, button, input, textarea, select, [role="button"]'))
}

export function hitTest(rocks: Rock[], x: number, y: number): Rock | null {
  const slop = ASTEROID_RADIUS + 4
  for (let i = rocks.length - 1; i >= 0; i--) {
    const rock = rocks[i]
    if (Math.hypot(rock.x - x, rock.y - y) <= slop) return rock
  }
  return null
}

export function measureWalls(): AABB[] {
  const walls: AABB[] = []
  const nav = document.querySelector('nav')
  if (nav) pushRect(walls, nav.getBoundingClientRect())
  document.querySelectorAll('[data-asteroid-wall]').forEach((el) => {
    pushRect(walls, el.getBoundingClientRect())
  })
  return walls
}

function pushRect(walls: AABB[], r: DOMRect) {
  if (r.width < 2 || r.height < 2) return
  walls.push({ x: r.left, y: r.top, width: r.width, height: r.height })
}

export type PointerSample = { t: number; x: number; y: number }

/** If the pointer has been still this long (ms), throw velocity is zero. */
const POINTER_STILL_MS = 50
/** Average pointer motion over this window (ms) when it is still moving. */
const POINTER_WINDOW_MS = 40

export function pushPointerSample(samples: PointerSample[], sample: PointerSample) {
  samples.push(sample)
  const cutoff = sample.t - 120
  while (samples.length > 1 && samples[0].t < cutoff) samples.shift()
}

/** Velocity of the pointer *now*, not a blend of earlier flight or earlier drag. */
export function velocityFromSamples(samples: PointerSample[], now: number): { vx: number; vy: number } {
  if (samples.length === 0) return { vx: 0, vy: 0 }
  const last = samples[samples.length - 1]
  if (now - last.t > POINTER_STILL_MS) return { vx: 0, vy: 0 }

  let i = samples.length - 1
  while (i > 0 && last.t - samples[i - 1].t <= POINTER_WINDOW_MS) i--
  const first = samples[i]
  const dt = (last.t - first.t) / 1000
  if (dt < 0.004) {
    if (samples.length < 2) return { vx: 0, vy: 0 }
    const a = samples[samples.length - 2]
    const d = (last.t - a.t) / 1000
    if (d < 1e-4) return { vx: 0, vy: 0 }
    return { vx: (last.x - a.x) / d, vy: (last.y - a.y) / d }
  }
  const vx = (last.x - first.x) / dt
  const vy = (last.y - first.y) / dt
  if (!Number.isFinite(vx) || !Number.isFinite(vy)) return { vx: 0, vy: 0 }
  return { vx, vy }
}

export function applyPointerVelocity(rock: Rock, samples: PointerSample[], now: number) {
  const v = velocityFromSamples(samples, now)
  rock.vx = v.vx
  rock.vy = v.vy
  clampThrow(rock)
}

export function clampThrow(rock: Rock) {
  const speed = Math.hypot(rock.vx, rock.vy)
  if (speed > MAX_SPEED) {
    const s = MAX_SPEED / speed
    rock.vx *= s
    rock.vy *= s
  }
  rock.spin = clamp(rock.spin, -MAX_SPIN, MAX_SPIN)
}

export function stepRocks(
  rocks: Rock[],
  dt: number,
  viewport: { width: number; height: number },
  walls: AABB[],
) {
  if (dt <= 0) return
  const r = ASTEROID_RADIUS
  const damp = Math.exp(-DRAG * dt)

  for (const rock of rocks) {
    if (rock.held) {
      if (dt > 1e-4) {
        rock.vx = (rock.x - rock.px) / dt
        rock.vy = (rock.y - rock.py) / dt
        clampThrow(rock)
      }
      rock.angle += rock.spin * dt
      continue
    }

    rock.x += rock.vx * dt
    rock.y += rock.vy * dt
    rock.vx *= damp
    rock.vy *= damp

    const speed = Math.hypot(rock.vx, rock.vy)
    const spinSign =
      Math.abs(rock.spin) > 0.15 ? Math.sign(rock.spin) : Math.sign(rock.vx) || 1
    const targetSpin = (speed / Math.max(r, 1)) * spinSign * 0.55
    rock.spin += (targetSpin - rock.spin) * Math.min(1, 6 * dt)
    rock.spin *= Math.exp(-SPIN_DAMP * dt * (speed < STOP_SPEED ? 4 : 0.25))
    rock.angle += rock.spin * dt

    if (speed < STOP_SPEED && Math.abs(rock.spin) < 0.12) {
      rock.vx = 0
      rock.vy = 0
      rock.spin = 0
    }
  }

  const holding = rocks.some((rock) => rock.held)
  const passes = holding ? 5 : 2
  for (let pass = 0; pass < passes; pass++) {
    for (const rock of rocks) {
      if (rock.held) continue
      bounceViewport(rock, viewport, r)
      for (const wall of walls) bounceAabb(rock, wall, r)
    }
    collidePairs(rocks, r)
  }

  for (const rock of rocks) {
    rock.px = rock.x
    rock.py = rock.y
  }
}

/** Immediate knocks while dragging, before the next animation frame. */
export function resolveHeldKnocks(rocks: Rock[]) {
  collidePairs(rocks, ASTEROID_RADIUS)
}

function bounceViewport(rock: Rock, viewport: { width: number; height: number }, r: number) {
  const w = viewport.width
  const h = viewport.height
  if (rock.x < r) {
    rock.x = r
    if (rock.vx < 0) rock.vx = -rock.vx * REST_WALL
  } else if (rock.x > w - r) {
    rock.x = w - r
    if (rock.vx > 0) rock.vx = -rock.vx * REST_WALL
  }
  if (rock.y < r) {
    rock.y = r
    if (rock.vy < 0) rock.vy = -rock.vy * REST_WALL
  } else if (rock.y > h - r) {
    rock.y = h - r
    if (rock.vy > 0) rock.vy = -rock.vy * REST_WALL
  }
}

function bounceAabb(rock: Rock, box: AABB, r: number) {
  const left = box.x
  const right = box.x + box.width
  const top = box.y
  const bottom = box.y + box.height
  const cx = clamp(rock.x, left, right)
  const cy = clamp(rock.y, top, bottom)
  let nx = rock.x - cx
  let ny = rock.y - cy
  let d2 = nx * nx + ny * ny

  if (d2 < 1e-8) {
    const dl = rock.x - left
    const dr = right - rock.x
    const dt = rock.y - top
    const db = bottom - rock.y
    const min = Math.min(dl, dr, dt, db)
    if (min === dl) {
      nx = -1
      ny = 0
      rock.x = left - r
    } else if (min === dr) {
      nx = 1
      ny = 0
      rock.x = right + r
    } else if (min === dt) {
      nx = 0
      ny = -1
      rock.y = top - r
    } else {
      nx = 0
      ny = 1
      rock.y = bottom + r
    }
    const vn = rock.vx * nx + rock.vy * ny
    if (vn < 0) {
      rock.vx -= (1 + REST_WALL) * vn * nx
      rock.vy -= (1 + REST_WALL) * vn * ny
    }
    return
  }

  if (d2 >= r * r) return

  const d = Math.sqrt(d2)
  nx /= d
  ny /= d
  const pen = r - d
  rock.x += nx * pen
  rock.y += ny * pen
  const vn = rock.vx * nx + rock.vy * ny
  if (vn < 0) {
    rock.vx -= (1 + REST_WALL) * vn * nx
    rock.vy -= (1 + REST_WALL) * vn * ny
  }
}

function collidePairs(rocks: Rock[], radius: number) {
  const minDist = radius * 2
  for (let i = 0; i < rocks.length; i++) {
    for (let j = i + 1; j < rocks.length; j++) {
      const a = rocks[i]
      const b = rocks[j]
      if (a.held && b.held) continue

      if (a.held) {
        collideHeldSweep(a, b, minDist)
        continue
      }
      if (b.held) {
        collideHeldSweep(b, a, minDist)
        continue
      }

      let dx = b.x - a.x
      let dy = b.y - a.y
      let dist = Math.hypot(dx, dy)
      if (dist >= minDist) continue
      if (dist < 1e-6) {
        dx = 1
        dy = 0
        dist = 1
      }
      const nx = dx / dist
      const ny = dy / dist
      const overlap = minDist - dist

      a.x -= nx * overlap * 0.5
      a.y -= ny * overlap * 0.5
      b.x += nx * overlap * 0.5
      b.y += ny * overlap * 0.5
      const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (rvn > 0) continue
      const impulse = (-(1 + REST_BALL) * rvn) / 2
      a.vx -= impulse * nx
      a.vy -= impulse * ny
      b.vx += impulse * nx
      b.vy += impulse * ny
    }
  }
}

function collideHeldSweep(held: Rock, free: Rock, minDist: number) {
  const mx = held.x - held.px
  const my = held.y - held.py
  const len2 = mx * mx + my * my
  let t = 0
  if (len2 > 1e-8) {
    t = clamp(((free.x - held.px) * mx + (free.y - held.py) * my) / len2, 0, 1)
  }
  const hx = held.px + mx * t
  const hy = held.py + my * t
  const sweepDist = Math.hypot(free.x - hx, free.y - hy)

  let dx = free.x - held.x
  let dy = free.y - held.y
  let dist = Math.hypot(dx, dy)
  if (sweepDist > minDist && dist > minDist) return

  if (dist < 1e-6) {
    dx = free.x - hx
    dy = free.y - hy
    dist = Math.hypot(dx, dy)
  }
  if (dist < 1e-6) {
    dx = 1
    dy = 0
    dist = 1
  }
  const nx = dx / dist
  const ny = dy / dist
  const overlap = dist > minDist ? 0 : minDist - dist
  knockFreeFromHeld(held, free, nx, ny, overlap)
}

function knockFreeFromHeld(
  held: Rock,
  free: Rock,
  nx: number,
  ny: number,
  overlap: number,
) {
  const slop = overlap + 0.6
  free.x += nx * slop
  free.y += ny * slop

  const heldN = held.vx * nx + held.vy * ny
  const freeN = free.vx * nx + free.vy * ny
  const heldSpeed = Math.hypot(held.vx, held.vy)
  if (heldSpeed < 28 && heldN < 12) return

  const bounce = heldN + Math.max(MIN_KNOCK, Math.abs(heldN) * REST_HELD)
  const newFreeN = Math.max(freeN, bounce)
  const d = newFreeN - freeN
  free.vx += d * nx
  free.vy += d * ny
  free.spin += (held.vx * -ny + held.vy * nx) * 0.012
  clampThrow(free)
}
