#!/usr/bin/env node
// Convert the n-body basin .npz models into a compact, web-ready payload.
//
// Each source .npz (in basins-src/, gitignored) holds a regular r^k lattice:
//   positions (N,4) f32, hit (N,) i32 [-1 timeout | planet index], time (N,) f32,
//   meta (JSON string). Because the lattice is in row-major index order, the
//   positions are fully derivable from the linear index — so we ship ONLY the
//   `hit` array (as int8) plus the small meta JSON. `hit` is spatially coherent,
//   so it gzips to a fraction of its size on the wire.
//
// Emits, per model, into public/data/basins/:
//   <key>.bin   Int8Array of hit (length N)
//   <key>.json  meta + display fields
// plus index.json listing the models. Uses the system `unzip` (only hit.npy and
// meta.npy are extracted, never the 100 MB positions). Run locally; the build
// only reads the committed artifacts.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = path.join(ROOT, 'basins-src')
const OUT_DIR = path.join(ROOT, 'public/data/basins')

// --- .npy parsing ----------------------------------------------------------
function parseNpy(buf) {
  if (buf.toString('latin1', 0, 6) !== '\x93NUMPY') throw new Error('not an .npy file')
  const major = buf[6]
  let headerLen, headerStart
  if (major === 1) {
    headerLen = buf.readUInt16LE(8)
    headerStart = 10
  } else {
    headerLen = buf.readUInt32LE(8)
    headerStart = 12
  }
  const header = buf.toString('latin1', headerStart, headerStart + headerLen)
  const descr = /'descr':\s*'([^']+)'/.exec(header)[1]
  const shapeRaw = /'shape':\s*\(([^)]*)\)/.exec(header)[1]
  const shape = shapeRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
  return { descr, shape, dataOffset: headerStart + headerLen }
}

function readInt32Array(buf) {
  const { descr, shape, dataOffset } = parseNpy(buf)
  if (descr !== '<i4') throw new Error(`expected <i4, got ${descr}`)
  const count = shape.reduce((a, b) => a * b, 1)
  // copy into a fresh aligned ArrayBuffer
  const ab = buf.buffer.slice(buf.byteOffset + dataOffset, buf.byteOffset + dataOffset + count * 4)
  return new Int32Array(ab)
}

function readUnicodeScalar(buf) {
  const { descr, dataOffset } = parseNpy(buf)
  const m = /^<U(\d+)$/.exec(descr)
  if (!m) throw new Error(`expected <U*, got ${descr}`)
  const n = Number(m[1])
  let s = ''
  for (let i = 0; i < n; i++) {
    const cp = buf.readUInt32LE(dataOffset + i * 4)
    if (cp === 0) break
    s += String.fromCodePoint(cp)
  }
  return s
}

// --- process one model -----------------------------------------------------
function keyFor(meta, fileName) {
  if (typeof meta.relativistic === 'boolean') {
    return meta.relativistic ? 'relativistic' : 'newtonian'
  }
  return path.basename(fileName, '.npz').replace(/[^a-z0-9]+/gi, '_').toLowerCase()
}

function nameFor(key) {
  if (key === 'newtonian') return 'Newtonian'
  if (key === 'relativistic') return 'Relativistic'
  return key
}

function process(fileName) {
  const npzPath = path.join(SRC_DIR, fileName)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'basins-'))
  execFileSync('unzip', ['-o', '-q', npzPath, 'hit.npy', 'meta.npy', '-d', tmp])

  const meta = JSON.parse(readUnicodeScalar(fs.readFileSync(path.join(tmp, 'meta.npy'))))
  const hit = readInt32Array(fs.readFileSync(path.join(tmp, 'hit.npy')))

  const maxHit = hit.reduce((m, v) => (v > m ? v : m), -1)
  if (maxHit > 127) throw new Error(`hit index ${maxHit} exceeds int8 range`)

  const out = new Int8Array(hit.length)
  for (let i = 0; i < hit.length; i++) out[i] = hit[i]

  const key = keyFor(meta, fileName)
  fs.writeFileSync(path.join(OUT_DIR, `${key}.bin`), Buffer.from(out.buffer))

  const axes = meta.cube_axes ?? []
  const json = {
    key,
    name: nameFor(key),
    resolution: meta.resolution,
    halfExtent: meta.half_extent,
    cubeCenter: meta.cube_center,
    axisCount: axes.length,
    extraAxisCount: Math.max(0, axes.length - 3),
    pointCount: hit.length,
    planets: (meta.planets ?? []).map((p) => ({
      position: p.position,
      mass: p.mass,
      radius: p.radius,
      color: p.color,
    })),
    g: meta.g,
    dt: meta.dt,
    tMax: meta.t_max,
    forceExponent: meta.force_exponent,
    relativistic: !!meta.relativistic,
  }
  fs.writeFileSync(path.join(OUT_DIR, `${key}.json`), JSON.stringify(json, null, 2))
  fs.rmSync(tmp, { recursive: true, force: true })

  const counts = {}
  for (let i = 0; i < hit.length; i++) counts[hit[i]] = (counts[hit[i]] || 0) + 1
  console.log(
    `✓ ${fileName} → ${key} (${json.pointCount.toLocaleString()} pts, r=${json.resolution}, ` +
      `${json.axisCount}D, ${json.planets.length} planets, relativistic=${json.relativistic})`,
  )
  console.log(`  hit distribution: ${JSON.stringify(counts)}`)
  return { key, name: json.name, file: `${key}.bin`, meta: `${key}.json`, relativistic: json.relativistic }
}

// --- main ------------------------------------------------------------------
fs.mkdirSync(OUT_DIR, { recursive: true })
const files = fs
  .readdirSync(SRC_DIR)
  .filter((f) => f.endsWith('.npz'))
  .sort()
if (files.length === 0) {
  console.error(`No .npz files in ${SRC_DIR}. Drop the model .npz files there.`)
  process.exit(1)
}

const all = files.map(process)
// Dedupe by key (the example set ships the same model twice under different names)
const seen = new Set()
const models = []
for (const m of all) {
  if (seen.has(m.key)) {
    console.log(`  · skipping duplicate model "${m.key}"`)
    continue
  }
  seen.add(m.key)
  models.push(m)
}
// Newtonian first if present
models.sort((a, b) => Number(a.relativistic) - Number(b.relativistic))
fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify({ models }, null, 2))
console.log(`\n✓ Wrote ${models.length} model(s) + index.json to public/data/basins/`)
