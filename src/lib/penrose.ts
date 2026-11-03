export interface Vec {
  x: number
  y: number
}

export interface Rhomb {
  verts: [Vec, Vec, Vec, Vec]
  thick: boolean
}

export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const zeta: Vec[] = Array.from({ length: 5 }, (_, i) => {
  const a = (2 * Math.PI * i) / 5
  return { x: Math.cos(a), y: Math.sin(a) }
})

function scale(v: Vec, s: number): Vec {
  return { x: v.x * s, y: v.y * s }
}

function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y }
}

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y }
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ceilStable(x: number) {
  const nearest = Math.round(x)
  if (Math.abs(x - nearest) < 1e-8) return nearest
  return Math.ceil(x)
}

function gammasFromSeed(seed: number): number[] {
  const rand = mulberry32(seed)
  const g = [0, 0, 0, 0, 0]
  let sum = 0
  for (let i = 0; i < 4; i++) {
    g[i] = 0.12 + rand() * 0.76
    sum += g[i]
  }
  g[4] = -sum
  const fractional = g[4] - Math.floor(g[4])
  if (fractional < 0.08 || fractional > 0.92) {
    g[0] += 0.2
    g[4] -= 0.2
  }
  return g
}

function intersection(gamma: number[], r: number, s: number, kr: number, ks: number): Vec {
  const term = sub(scale(zeta[r], ks - gamma[s]), scale(zeta[s], kr - gamma[r]))
  const rotated = { x: -term.y, y: term.x }
  const denom = zeta[s - r].y
  return scale(rotated, 1 / denom)
}

function rhombAt(gamma: number[], r: number, s: number, kr: number, ks: number): Rhomb {
  const z0 = intersection(gamma, r, s, kr, ks)
  const k = zeta.map((t, j) => ceilStable(dot(z0, t) + gamma[j]))
  const pairs: [number, number][] = [
    [kr, ks],
    [kr + 1, ks],
    [kr + 1, ks + 1],
    [kr, ks + 1],
  ]
  const verts = pairs.map(([krv, ksv]) => {
    k[r] = krv
    k[s] = ksv
    let v = { x: 0, y: 0 }
    for (let j = 0; j < 5; j++) v = add(v, scale(zeta[j], k[j]))
    return v
  }) as [Vec, Vec, Vec, Vec]

  const apart = Math.min(s - r, 5 - (s - r))
  return { verts, thick: apart === 1 }
}

function vertexKey(v: Vec): string {
  return `${Math.round(v.x * 1e6)},${Math.round(v.y * 1e6)}`
}

function edgeKey(a: Vec, b: Vec): string {
  const ka = vertexKey(a)
  const kb = vertexKey(b)
  return ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`
}

function vertexNeighbors(rhombs: Rhomb[]): number[][] {
  const atVertex = new Map<string, number[]>()
  rhombs.forEach((rhomb, index) => {
    for (const vertex of rhomb.verts) {
      const key = vertexKey(vertex)
      const list = atVertex.get(key)
      if (list) list.push(index)
      else atVertex.set(key, [index])
    }
  })

  const sets = rhombs.map(() => new Set<number>())
  for (const list of atVertex.values()) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        sets[list[i]].add(list[j])
        sets[list[j]].add(list[i])
      }
    }
  }
  return sets.map((set) => [...set])
}

export interface PenroseTiling {
  rhombs: Rhomb[]
  neighbors: number[][]
}

function mainPatch(rhombs: Rhomb[]): PenroseTiling {
  const edgeTiles = new Map<string, number[]>()
  rhombs.forEach((rhomb, index) => {
    const verts = rhomb.verts
    for (let i = 0; i < 4; i++) {
      const key = edgeKey(verts[i], verts[(i + 1) % 4])
      const list = edgeTiles.get(key)
      if (list) list.push(index)
      else edgeTiles.set(key, [index])
    }
  })

  const neighbors: number[][] = rhombs.map(() => [])
  for (const list of edgeTiles.values()) {
    if (list.length !== 2) continue
    neighbors[list[0]].push(list[1])
    neighbors[list[1]].push(list[0])
  }

  const seen = new Uint8Array(rhombs.length)
  let best: number[] = []
  for (let i = 0; i < rhombs.length; i++) {
    if (seen[i]) continue
    const component: number[] = []
    const stack = [i]
    seen[i] = 1
    while (stack.length) {
      const current = stack.pop() as number
      component.push(current)
      for (const next of neighbors[current]) {
        if (seen[next]) continue
        seen[next] = 1
        stack.push(next)
      }
    }
    if (component.length > best.length) best = component
  }

  const patch = best.map((index) => rhombs[index])
  return { rhombs: patch, neighbors: vertexNeighbors(patch) }
}

export function generatePenrose(seed: number, iterations: number): PenroseTiling {
  const depth = Math.max(1, Math.min(16, Math.round(iterations)))
  const gamma = gammasFromSeed(seed)
  const rhombs: Rhomb[] = []
  for (let r = 0; r < 5; r++) {
    for (let s = r + 1; s < 5; s++) {
      for (let kr = -depth; kr <= depth; kr++) {
        for (let ks = -depth; ks <= depth; ks++) {
          rhombs.push(rhombAt(gamma, r, s, kr, ks))
        }
      }
    }
  }
  return mainPatch(rhombs)
}

export function tilingBounds(rhombs: Rhomb[]): Bounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const rhomb of rhombs) {
    for (const v of rhomb.verts) {
      if (v.x < minX) minX = v.x
      if (v.y < minY) minY = v.y
      if (v.x > maxX) maxX = v.x
      if (v.y > maxY) maxY = v.y
    }
  }
  return { minX, minY, maxX, maxY }
}
