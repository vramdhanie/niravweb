'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type * as THREE from 'three'
import {
  loadIndex,
  loadModel,
  palette as buildPalette,
  sampleValues,
  type BasinIndexEntry,
  type BasinModel,
} from '@/lib/basins'
import PlanePicker, { type Axis, type PlaneSets } from './PlanePicker'

type Preview = { axis: Axis; index: number } | null

// A round point sprite so the cloud reads as dots, not squares.
function makeDiscTexture(TH: typeof import('three')): THREE.Texture {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.7, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()
  const tex = new TH.CanvasTexture(c)
  tex.needsUpdate = true
  return tex
}

const fullSet = (r: number) => new Set(Array.from({ length: r }, (_, i) => i))

export default function BasinsViewer() {
  const mountRef = useRef<HTMLDivElement>(null)

  const [entries, setEntries] = useState<BasinIndexEntry[]>([])
  const [modelKey, setModelKey] = useState<string>('')
  const [model, setModel] = useState<BasinModel | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  // controls
  const [slice, setSlice] = useState(0)
  const [pointSize, setPointSize] = useState(2.6)
  const [planetsOn, setPlanetsOn] = useState<boolean[]>([])
  const [planeSets, setPlaneSets] = useState<PlaneSets>({ yz: new Set(), xz: new Set(), xy: new Set() })
  const [preview, setPreview] = useState<Preview>(null)
  const [visibleCount, setVisibleCount] = useState(0)

  // imperative scene handles + a live mirror of the controls for the render closures
  const sceneApi = useRef<{
    rebuild?: () => void
    updatePlanets?: () => void
    setSize?: (n: number) => void
    dispose?: () => void
  }>({})
  const ctrl = useRef({ slice, planeSets, preview, planetsOn })
  ctrl.current = { slice, planeSets, preview, planetsOn }

  const r = model?.meta.resolution ?? 0

  // ---- load index + first model -------------------------------------------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const idx = await loadIndex()
        if (cancelled) return
        setEntries(idx)
        setModelKey(idx[0].key)
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Failed to load models')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // ---- load the selected model --------------------------------------------
  useEffect(() => {
    if (!modelKey || entries.length === 0) return
    const entry = entries.find((e) => e.key === modelKey)
    if (!entry) return
    let cancelled = false
    setStatus('loading')
    ;(async () => {
      try {
        const m = await loadModel(entry)
        if (cancelled) return
        const res = m.meta.resolution
        setModel(m)
        setSlice(Math.floor((res - 1) / 2)) // central slice (w ≈ 0)
        setPlanetsOn(m.meta.planets.map(() => true))
        setPlaneSets({ yz: fullSet(res), xz: fullSet(res), xy: fullSet(res) })
        setStatus('ready')
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : 'Failed to load model')
          setStatus('error')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [modelKey, entries])

  // ---- build the Three.js scene when a model is ready ---------------------
  useEffect(() => {
    if (!model || !mountRef.current || status !== 'ready') return
    const mount = mountRef.current
    let disposed = false
    let raf = 0

    ;(async () => {
      const TH = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      if (disposed) return

      const { meta, hit } = model
      const res = meta.resolution
      const samples = sampleValues(meta.halfExtent, res)
      const pal = buildPalette(meta)
      const maxPerSlice = res * res * res

      const width = mount.clientWidth || 800
      const height = mount.clientHeight || 500

      const renderer = new TH.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0x080a0f, 1)
      mount.appendChild(renderer.domElement)

      const scene = new TH.Scene()
      const camera = new TH.PerspectiveCamera(50, width / height, 0.01, 100)
      camera.position.set(2.6, 2.0, 3.4)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.target.set(0, 0, 0)
      controls.minDistance = 0.6
      controls.maxDistance = 20

      // wireframe cube (the first-three-axis bounds)
      const span = 2 * meta.halfExtent
      const box = new TH.LineSegments(
        new TH.EdgesGeometry(new TH.BoxGeometry(span, span, span)),
        new TH.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }),
      )
      scene.add(box)

      // point cloud (preallocated to one full slice)
      const posArr = new Float32Array(maxPerSlice * 3)
      const colArr = new Float32Array(maxPerSlice * 3)
      const geom = new TH.BufferGeometry()
      geom.setAttribute('position', new TH.BufferAttribute(posArr, 3))
      geom.setAttribute('color', new TH.BufferAttribute(colArr, 3))
      const disc = makeDiscTexture(TH)
      const mat = new TH.PointsMaterial({
        size: pointSize,
        sizeAttenuation: false,
        vertexColors: true,
        map: disc,
        alphaTest: 0.5,
        transparent: true,
      })
      const points = new TH.Points(geom, mat)
      points.frustumCulled = false
      scene.add(points)

      // planet balls (unit spheres scaled per slice)
      const planetGroups: THREE.Group[] = meta.planets.map((p) => {
        const color = new TH.Color(p.color[0] / 255, p.color[1] / 255, p.color[2] / 255)
        const g = new TH.Group()
        const fill = new TH.Mesh(
          new TH.SphereGeometry(1, 24, 16),
          new TH.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
        )
        const wire = new TH.LineSegments(
          new TH.EdgesGeometry(new TH.SphereGeometry(1, 12, 8)),
          new TH.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }),
        )
        g.add(fill, wire)
        g.position.set(p.position[0] ?? 0, p.position[1] ?? 0, 0)
        scene.add(g)
        return g
      })

      // ---- rebuild the visible slice into the point buffer ----
      const rebuild = () => {
        const { slice: l0, planeSets: ps, preview: pv } = ctrl.current
        const r2 = res * res
        let count = 0
        for (let i = 0; i < res; i++) {
          const inYZ = ps.yz.has(i)
          const x = samples[i]
          for (let j = 0; j < res; j++) {
            const inXZ = ps.xz.has(j)
            const y = samples[j]
            const base = (i * res + j) * r2 + l0
            for (let k = 0; k < res; k++) {
              let vis: boolean
              if (pv) {
                vis = pv.axis === 0 ? i === pv.index : pv.axis === 1 ? j === pv.index : k === pv.index
              } else {
                vis = inYZ || inXZ || ps.xy.has(k)
              }
              if (!vis) continue
              const h = hit[base + k * res]
              if (h < 0) continue
              const o = count * 3
              posArr[o] = x
              posArr[o + 1] = y
              posArr[o + 2] = samples[k]
              const c = pal[h]
              colArr[o] = c[0]
              colArr[o + 1] = c[1]
              colArr[o + 2] = c[2]
              count++
            }
          }
        }
        geom.setDrawRange(0, count)
        ;(geom.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
        ;(geom.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
        setVisibleCount(count)
      }

      // ---- planet balls: intersection of each n-sphere with the current 3-flat ----
      const updatePlanets = () => {
        const { slice: l0, planetsOn: on } = ctrl.current
        const w0 = samples[l0]
        meta.planets.forEach((p, i) => {
          const rr = p.radius * p.radius - w0 * w0
          const grp = planetGroups[i]
          if ((on[i] ?? true) && rr > 0) {
            const rad = Math.sqrt(rr)
            grp.scale.setScalar(rad)
            grp.visible = true
          } else {
            grp.visible = false
          }
        })
      }

      sceneApi.current = {
        rebuild,
        updatePlanets,
        setSize: (n) => {
          mat.size = n
        },
        dispose: () => {},
      }

      rebuild()
      updatePlanets()

      const onResize = () => {
        const w = mount.clientWidth || 800
        const h = mount.clientHeight || 500
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      const ro = new ResizeObserver(onResize)
      ro.observe(mount)

      const animate = () => {
        controls.update()
        renderer.render(scene, camera)
        raf = requestAnimationFrame(animate)
      }
      animate()

      sceneApi.current.dispose = () => {
        cancelAnimationFrame(raf)
        ro.disconnect()
        controls.dispose()
        geom.dispose()
        mat.dispose()
        disc.dispose()
        box.geometry.dispose()
        ;(box.material as THREE.Material).dispose()
        planetGroups.forEach((g) =>
          g.children.forEach((ch) => {
            const m = ch as THREE.Mesh
            m.geometry?.dispose()
            ;(m.material as THREE.Material)?.dispose()
          }),
        )
        renderer.dispose()
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
      }
    })()

    return () => {
      disposed = true
      sceneApi.current.dispose?.()
      sceneApi.current = {}
    }
  }, [model, status]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- push control changes into the scene --------------------------------
  useEffect(() => {
    sceneApi.current.rebuild?.()
    sceneApi.current.updatePlanets?.()
  }, [slice, planeSets, preview, planetsOn])

  useEffect(() => {
    sceneApi.current.setSize?.(pointSize)
  }, [pointSize])

  // ---- UI handlers --------------------------------------------------------
  const togglePlane = useCallback((axis: Axis, index: number) => {
    setPlaneSets((prev) => {
      const key = axis === 0 ? 'yz' : axis === 1 ? 'xz' : 'xy'
      const next = new Set(prev[key])
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return { ...prev, [key]: next }
    })
  }, [])

  const allPlane = useCallback(
    (axis: Axis, on: boolean) => {
      setPlaneSets((prev) => {
        const key = axis === 0 ? 'yz' : axis === 1 ? 'xz' : 'xy'
        return { ...prev, [key]: on ? fullSet(r) : new Set<number>() }
      })
    },
    [r],
  )

  const sliceW = model ? sampleValues(model.meta.halfExtent, r)[slice] : 0
  const legend = useMemo(() => model?.meta.planets ?? [], [model])

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080a0f] text-white">
      <div className="grid gap-0 md:grid-cols-[1fr_280px]">
        {/* canvas */}
        <div className="relative min-h-[380px] md:min-h-[520px]">
          <div ref={mountRef} className="absolute inset-0" />
          {status !== 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
              {status === 'error' ? `Error: ${errorMsg}` : 'Loading model…'}
            </div>
          )}
          {status === 'ready' && (
            <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-white/45">
              drag to rotate · scroll to zoom · shift-drag to pan
            </div>
          )}
        </div>

        {/* controls */}
        <div className="space-y-4 border-t border-white/10 p-4 text-sm md:border-l md:border-t-0">
          {entries.length > 1 && (
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                Model
              </span>
              <select
                value={modelKey}
                onChange={(e) => setModelKey(e.target.value)}
                className="w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-sm"
              >
                {entries.map((e) => (
                  <option key={e.key} value={e.key} className="bg-[#080a0f]">
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-white/50">
              <span>4th dimension (w)</span>
              <span className="tabular-nums text-white/70">
                {slice + 1}/{r} · {sliceW.toFixed(2)}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, r - 1)}
              value={slice}
              onChange={(e) => setSlice(Number(e.target.value))}
              className="w-full accent-[var(--secondary)]"
              disabled={status !== 'ready'}
            />
          </label>

          <label className="block">
            <span className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-white/50">
              <span>Point size</span>
              <span className="tabular-nums text-white/70">{pointSize.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={1}
              max={6}
              step={0.2}
              value={pointSize}
              onChange={(e) => setPointSize(Number(e.target.value))}
              className="w-full accent-[var(--secondary)]"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
              Planets
            </span>
            <div className="space-y-1.5">
              {legend.map((p, i) => (
                <label key={i} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={planetsOn[i] ?? true}
                    onChange={(e) =>
                      setPlanetsOn((prev) => {
                        const next = [...prev]
                        next[i] = e.target.checked
                        return next
                      })
                    }
                    className="accent-[var(--secondary)]"
                  />
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: `rgb(${p.color[0]},${p.color[1]},${p.color[2]})` }}
                  />
                  <span className="text-white/75">Planet {i + 1}</span>
                </label>
              ))}
            </div>
          </div>

          {r > 0 && (
            <div>
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-white/50">
                Coordinate planes
              </span>
              <PlanePicker
                resolution={r}
                sets={planeSets}
                onToggle={togglePlane}
                onAll={allPlane}
                onPreview={setPreview}
              />
            </div>
          )}

          <div className="border-t border-white/10 pt-3 text-[11px] text-white/45">
            {visibleCount.toLocaleString()} points shown ·{' '}
            {model ? model.meta.pointCount.toLocaleString() : '—'} total
          </div>
        </div>
      </div>
    </div>
  )
}
