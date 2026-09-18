// Client-side loader + helpers for the n-body collision-basin models.
//
// The models are a regular r^k lattice stored in row-major (C) order, with the
// LAST axis varying fastest: linear index n -> (i, j, k, l) where
//   i = ⌊n / r³⌋ % r,  j = ⌊n / r²⌋ % r,  k = ⌊n / r⌋ % r,  l = n % r.
// The first three axes are the visible cube (x, y, z); the 4th (l) is the
// "extra"/slice dimension. Positions are derived from the index, so we ship
// the per-point `hit` array (int8: planet index, or -1 for a timeout) and an
// optional `time` array (uint8: round(255 * t / t_max)).

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
  time?: string
  relativistic: boolean
}

export interface BasinModel {
  meta: BasinMeta
  hit: Int8Array
  time?: Uint8Array
}

const BASE = '/data/basins'

export async function loadIndex(): Promise<BasinIndexEntry[]> {
  const res = await fetch(`${BASE}/index.json`)
  if (!res.ok) throw new Error(`Failed to load model index (${res.status})`)
  const json = (await res.json()) as { models: BasinIndexEntry[] }
  return json.models
}

export async function loadModel(entry: BasinIndexEntry): Promise<BasinModel> {
  const fetches = [
    fetch(`${BASE}/${entry.meta}`),
    fetch(`${BASE}/${entry.file}`),
    entry.time ? fetch(`${BASE}/${entry.time}`) : Promise.resolve(null),
  ] as const
  const [metaRes, binRes, timeRes] = await Promise.all(fetches)
  if (!metaRes.ok || !binRes.ok) throw new Error(`Failed to load model "${entry.key}"`)
  const meta = (await metaRes.json()) as BasinMeta
  const hit = new Int8Array(await binRes.arrayBuffer())
  let time: Uint8Array | undefined
  if (timeRes && timeRes.ok) time = new Uint8Array(await timeRes.arrayBuffer())
  return { meta, hit, time }
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

/** Time-to-hit ramp: 0 (fast) red → yellow → 1 (slow) green. */
export function timeHeatColour(u: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, u))
  if (t < 0.5) {
    const s = t * 2
    return [1, s, 0]
  }
  const s = (t - 0.5) * 2
  return [1 - s, 1, 0]
}
