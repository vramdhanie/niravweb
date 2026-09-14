// Client-side loader + helpers for the n-body collision-basin models.
//
// The models are a regular r^k lattice stored in row-major (C) order, with the
// LAST axis varying fastest: linear index n -> (i, j, k, l) where
//   i = ⌊n / r³⌋ % r,  j = ⌊n / r²⌋ % r,  k = ⌊n / r⌋ % r,  l = n % r.
// The first three axes are the visible cube (x, y, z); the 4th (l) is the
// "extra"/slice dimension. Positions are derived from the index, so only the
// per-point `hit` array (int8: planet index, or -1 for a timeout) is shipped.

export interface Planet {
  position: number[]
  mass: number
  radius: number
  color: [number, number, number]
}

export interface BasinMeta {
  key: string
  name: string
  resolution: number
  halfExtent: number
  cubeCenter: number[]
  axisCount: number
  extraAxisCount: number
  pointCount: number
  planets: Planet[]
  g: number
  dt: number
  tMax: number
  forceExponent: number
  relativistic: boolean
}

export interface BasinIndexEntry {
  key: string
  name: string
  file: string
  meta: string
  relativistic: boolean
}

export interface BasinModel {
  meta: BasinMeta
  hit: Int8Array
}

const BASE = '/data/basins'

export async function loadIndex(): Promise<BasinIndexEntry[]> {
  const res = await fetch(`${BASE}/index.json`)
  if (!res.ok) throw new Error(`Failed to load model index (${res.status})`)
  const json = (await res.json()) as { models: BasinIndexEntry[] }
  return json.models
}

export async function loadModel(entry: BasinIndexEntry): Promise<BasinModel> {
  const [metaRes, binRes] = await Promise.all([
    fetch(`${BASE}/${entry.meta}`),
    fetch(`${BASE}/${entry.file}`),
  ])
  if (!metaRes.ok || !binRes.ok) throw new Error(`Failed to load model "${entry.key}"`)
  const meta = (await metaRes.json()) as BasinMeta
  const hit = new Int8Array(await binRes.arrayBuffer())
  return { meta, hit }
}

/** The r evenly-spaced lattice coordinate values on each axis. */
export function sampleValues(halfExtent: number, r: number): Float32Array {
  const s = new Float32Array(r)
  const span = 2 * halfExtent
  for (let i = 0; i < r; i++) s[i] = -halfExtent + (span * i) / (r - 1)
  return s
}

/** Planet colors as 0..1 RGB triples, indexed by hit value. */
export function palette(meta: BasinMeta): [number, number, number][] {
  return meta.planets.map((p) => [p.color[0] / 255, p.color[1] / 255, p.color[2] / 255])
}
