'use client'

import { useEffect, useRef, useState } from 'react'
import { generatePenrose, tilingBounds, type Rhomb, type Vec } from '@/lib/penrose'
import {
  GROUND,
  HEAD,
  SIMULATIONS,
  TAIL,
  WING,
  stepSimulation,
  type SimulationId,
} from '@/lib/simulations'

interface Camera {
  x: number
  y: number
  zoom: number
}

interface Board {
  rhombs: Rhomb[]
  neighbors: number[][]
  states: Uint8Array
  next: Uint8Array
}

const THICK = 'rgba(118, 130, 136, 0.42)'
const THIN = 'rgba(176, 162, 118, 0.42)'
const HEAD_COLOR = '#e0232a'
const TAIL_COLOR = '#1f9d4a'
const WING_COLOR = '#1d5fd0'
const STROKE = 'rgba(30, 30, 30, 0.22)'
const BACKGROUND = '#f3f1ec'
const MIN_ZOOM = 8
const MAX_ZOOM = 320

const labelClass =
  'text-sm font-bold uppercase tracking-[var(--main-spacing)] text-[var(--secondary)]'
const buttonClass =
  'cursor-pointer border border-black/20 px-3 py-2 text-xs font-bold uppercase tracking-[var(--main-spacing)] text-[var(--primary-dark)] transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary)]'
const roundButtonClass =
  'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/20 bg-white text-[var(--primary-dark)] shadow-sm transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary)]'

function PanelChevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path
        d={direction === 'left' ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const KEY = [
  { label: 'Ground', swatches: [THICK, THIN] },
  { label: 'Head', swatches: [HEAD_COLOR] },
  { label: 'Tail', swatches: [TAIL_COLOR] },
  { label: 'Wing', swatches: [WING_COLOR] },
] as const

function pointInRhomb(point: Vec, verts: [Vec, Vec, Vec, Vec]) {
  let sign = 0
  for (let i = 0; i < 4; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % 4]
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)
    if (Math.abs(cross) < 1e-9) continue
    const next = cross > 0 ? 1 : -1
    if (sign === 0) sign = next
    else if (sign !== next) return false
  }
  return true
}

function drawTiling(
  ctx: CanvasRenderingContext2D,
  board: Board,
  camera: Camera,
  width: number,
  height: number,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = BACKGROUND
  ctx.fillRect(0, 0, width, height)

  const project = (x: number, y: number) => ({
    x: (x - camera.x) * camera.zoom + width / 2,
    y: height / 2 - (y - camera.y) * camera.zoom,
  })

  const paint = (include: (index: number) => boolean, fill: string) => {
    ctx.beginPath()
    let any = false
    board.rhombs.forEach((rhomb, index) => {
      if (!include(index)) return
      any = true
      const [a, b, c, d] = rhomb.verts
      const pa = project(a.x, a.y)
      ctx.moveTo(pa.x, pa.y)
      for (const v of [b, c, d]) {
        const p = project(v.x, v.y)
        ctx.lineTo(p.x, p.y)
      }
      ctx.closePath()
    })
    if (!any) return
    ctx.fillStyle = fill
    ctx.fill()
  }

  const { states } = board
  paint((index) => states[index] === GROUND && board.rhombs[index].thick, THICK)
  paint((index) => states[index] === GROUND && !board.rhombs[index].thick, THIN)
  paint((index) => states[index] === HEAD, HEAD_COLOR)
  paint((index) => states[index] === TAIL, TAIL_COLOR)
  paint((index) => states[index] === WING, WING_COLOR)

  ctx.beginPath()
  for (const rhomb of board.rhombs) {
    const [a, b, c, d] = rhomb.verts
    const pa = project(a.x, a.y)
    ctx.moveTo(pa.x, pa.y)
    for (const v of [b, c, d]) {
      const p = project(v.x, v.y)
      ctx.lineTo(p.x, p.y)
    }
    ctx.closePath()
  }
  ctx.strokeStyle = STROKE
  ctx.lineWidth = 1
  ctx.lineJoin = 'miter'
  ctx.stroke()
}

export default function AperiodicGame() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fitRef = useRef<() => void>(() => {})
  const drawRef = useRef<() => void>(() => {})
  const boardRef = useRef<Board | null>(null)
  const simulationRef = useRef<SimulationId>('glider')
  const [seed, setSeed] = useState(1)
  const [seedText, setSeedText] = useState('1')
  const [iterations, setIterations] = useState(5)
  const [tileCount, setTileCount] = useState(0)
  const [simulation, setSimulation] = useState<SimulationId>('glider')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(6)
  const [helpOpen, setHelpOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(true)

  useEffect(() => {
    simulationRef.current = simulation
  }, [simulation])

  useEffect(() => {
    fitRef.current()
  }, [controlsOpen])

  useEffect(() => {
    if (!helpOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHelpOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helpOpen])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.height = '100dvh'
    return () => {
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.height = previous.bodyHeight
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    const delay = 1000 / speed
    const id = window.setInterval(() => {
      const board = boardRef.current
      if (!board) return
      stepSimulation(simulationRef.current, board.states, board.neighbors, board.next)
      board.states.set(board.next)
      drawRef.current()
    }, delay)
    return () => window.clearInterval(id)
  }, [playing, speed])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const tiling = generatePenrose(seed, iterations)
    const board: Board = {
      rhombs: tiling.rhombs,
      neighbors: tiling.neighbors,
      states: new Uint8Array(tiling.rhombs.length),
      next: new Uint8Array(tiling.rhombs.length),
    }
    boardRef.current = board
    setTileCount(tiling.rhombs.length)
    setPlaying(false)

    const camera: Camera = { x: 0, y: 0, zoom: 40 }
    let fitted = false
    let dragging = false
    let lastX = 0
    let lastY = 0

    const size = () => {
      const width = wrap.clientWidth
      const height = wrap.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      return { width, height }
    }

    const fit = () => {
      const { width, height } = size()
      if (width < 2 || height < 2 || board.rhombs.length === 0) return
      const bounds = tilingBounds(board.rhombs)
      const spanX = Math.max(bounds.maxX - bounds.minX, 1e-6)
      const spanY = Math.max(bounds.maxY - bounds.minY, 1e-6)
      camera.x = (bounds.minX + bounds.maxX) / 2
      camera.y = (bounds.minY + bounds.maxY) / 2
      camera.zoom = Math.min((width * 0.9) / spanX, (height * 0.9) / spanY)
      fitted = true
    }

    const draw = () => {
      const width = wrap.clientWidth
      const height = wrap.clientHeight
      if (width < 2 || height < 2) return
      drawTiling(context, board, camera, width, height)
    }
    drawRef.current = draw

    fitRef.current = () => {
      fit()
      draw()
    }

    const onResize = () => {
      size()
      if (!fitted) fit()
      draw()
    }

    const screenToWorld = (sx: number, sy: number) => {
      const width = wrap.clientWidth
      const height = wrap.clientHeight
      return {
        x: (sx - width / 2) / camera.zoom + camera.x,
        y: (height / 2 - sy) / camera.zoom + camera.y,
      }
    }

    const tileAt = (sx: number, sy: number) => {
      const point = screenToWorld(sx, sy)
      for (let i = board.rhombs.length - 1; i >= 0; i--) {
        if (pointInRhomb(point, board.rhombs[i].verts)) return i
      }
      return -1
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button === 0) {
        const rect = canvas.getBoundingClientRect()
        const index = tileAt(event.clientX - rect.left, event.clientY - rect.top)
        if (index < 0) return
        board.states[index] = (board.states[index] + 1) % 4
        draw()
        return
      }
      if (event.button !== 1) return
      event.preventDefault()
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      camera.x -= dx / camera.zoom
      camera.y += dy / camera.zoom
      draw()
    }

    const endDrag = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      canvas.style.cursor = ''
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const sx = event.clientX - rect.left
      const sy = event.clientY - rect.top
      const before = screenToWorld(sx, sy)
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, camera.zoom * Math.exp(-event.deltaY * 0.0015)))
      const width = wrap.clientWidth
      const height = wrap.clientHeight
      camera.zoom = next
      camera.x = before.x - (sx - width / 2) / next
      camera.y = before.y - (height / 2 - sy) / next
      draw()
    }

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 1) event.preventDefault()
    }

    const observer = new ResizeObserver(onResize)
    observer.observe(wrap)
    onResize()

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', endDrag)
    canvas.addEventListener('pointercancel', endDrag)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('auxclick', onMouseDown)

    return () => {
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('auxclick', onMouseDown)
      fitRef.current = () => {}
      drawRef.current = () => {}
      if (boardRef.current === board) boardRef.current = null
    }
  }, [seed, iterations])

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#f3f1ec]">
      {controlsOpen && (
      <aside className="relative flex w-[min(270px,85vw)] shrink-0 flex-col border-r border-black/10 bg-white">
        <button
          type="button"
          aria-label="Hide controls"
          onClick={() => setControlsOpen(false)}
          className={`${roundButtonClass} absolute top-3 right-3 z-10`}
        >
          <PanelChevron direction="left" />
        </button>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 pr-14">
        <div>
          <label htmlFor="penrose-simulation" className={labelClass}>
            Simulation
          </label>
          <select
            id="penrose-simulation"
            value={simulation}
            onChange={(event) => setSimulation(event.target.value as SimulationId)}
            className="mt-3 w-full cursor-pointer border border-black/15 bg-white px-3 py-2 text-[var(--primary-dark)] outline-none focus:border-[var(--secondary)]"
          >
            {SIMULATIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="penrose-seed" className={labelClass}>
            Seed
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="penrose-seed"
              value={seedText}
              inputMode="numeric"
              onChange={(event) => {
                const text = event.target.value
                setSeedText(text)
                if (/^-?\d+$/.test(text)) {
                  const next = Number(text)
                  if (Number.isSafeInteger(next)) {
                    setPlaying(false)
                    setSeed(next)
                  }
                }
              }}
              className="min-w-0 flex-1 border border-black/15 bg-white px-3 py-2 text-[var(--primary-dark)] outline-none focus:border-[var(--secondary)]"
            />
            <button
              type="button"
              onClick={() => {
                const next = Math.floor(Math.random() * 1_000_000_000)
                setPlaying(false)
                setSeed(next)
                setSeedText(String(next))
              }}
              className={`${buttonClass} shrink-0`}
            >
              Random
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="penrose-iterations" className={labelClass}>
              Iterations
            </label>
            <span className="text-sm text-[var(--primary-light)]">{iterations}</span>
          </div>
          <input
            id="penrose-iterations"
            type="range"
            min={1}
            max={16}
            step={1}
            value={iterations}
            onChange={(event) => {
              setPlaying(false)
              setIterations(Number(event.target.value))
            }}
            className="mt-4 w-full accent-[var(--secondary)]"
          />
        </div>

        <p className="text-sm text-[var(--primary-light)]">{tileCount} tiles</p>

        <button type="button" onClick={() => fitRef.current()} className={buttonClass}>
          Reset view
        </button>

        <div>
          <p className={labelClass}>Key</p>
          <ul className="mt-3 flex flex-col gap-2">
            {KEY.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm text-[var(--primary-dark)]">
                <span className="flex bg-[#f3f1ec]">
                  {item.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-3.5 w-3.5 border border-black/10"
                      style={{ background: color }}
                    />
                  ))}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3 pb-10">
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="penrose-speed" className={labelClass}>
                Speed
              </label>
              <span className="text-sm text-[var(--primary-light)]">{speed}/s</span>
            </div>
            <input
              id="penrose-speed"
              type="range"
              min={1}
              max={20}
              step={1}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="mt-3 w-full accent-[var(--secondary)]"
            />
          </div>
          <button type="button" onClick={() => setPlaying((value) => !value)} className={buttonClass}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => {
              const board = boardRef.current
              if (!board) return
              board.states.fill(0)
              setPlaying(false)
              drawRef.current()
            }}
            className={buttonClass}
          >
            Reset simulation
          </button>
          <p className="pt-2 text-sm leading-relaxed text-[var(--primary-light)]">
            Click a tile to cycle its state. Middle-click and drag to move. Scroll to zoom.
          </p>
        </div>
        </div>
      </aside>
      )}

      <div ref={wrapRef} className="relative min-h-0 min-w-0 flex-1">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          aria-label="Penrose tiling. Click a tile to cycle its state. Middle-click and drag to move. Scroll to zoom."
        />
        {!controlsOpen && (
          <button
            type="button"
            aria-label="Show controls"
            onClick={() => setControlsOpen(true)}
            className={`${roundButtonClass} absolute top-4 left-4 z-10 bg-white/90`}
          >
            <PanelChevron direction="right" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="absolute top-4 right-4 z-10 cursor-pointer border border-black/20 bg-white/90 px-3 py-2 text-sm text-[var(--primary-dark)] transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
        >
          how to play (?)
        </button>
        <a
          href="https://cp4space.hatsya.com/wp-content/uploads/2012/11/2012-penrose-gliders.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-1/2 z-10 max-w-[calc(100%-2rem)] -translate-x-1/2 bg-white/90 px-3 py-1.5 text-center text-xs leading-relaxed text-[var(--primary-light)] no-underline transition-colors hover:text-[var(--secondary)]"
        >
          Inspiration for this game: Adam P. Goucher, “Gliders in cellular automata on Penrose tilings” (2012)
        </a>
      </div>

      {helpOpen && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setHelpOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[calc(100%-2rem)] w-full max-w-lg overflow-y-auto bg-white px-6 py-5 text-[var(--primary-dark)] shadow-lg"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setHelpOpen(false)}
              className="absolute top-3 right-3 cursor-pointer px-2 py-1 text-lg leading-none text-[var(--primary-light)] transition-colors hover:text-[var(--primary-dark)]"
            >
              X
            </button>
            <h2 id="how-to-play-title" className={`${labelClass} pr-8`}>
              How to play
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              Click a tile to cycle through all 4 of its state. Press play to start the simulation and pause to stop the simulation. Press reset
              to completely clear the board. Middle-click and drag to pan around. Scroll to zoom.
            </p>
            <h3 className={`${labelClass} mt-5`}>Rules</h3>
            <p className="mt-3 text-sm leading-relaxed">
              Each step, a tile counts the heads, tails, and wings that share a corner with it. The
              first rule that fits is the one that happens.
            </p>
            <ul className="mt-3 flex flex-col gap-3 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex shrink-0 bg-[#f3f1ec]">
                  <span className="h-3.5 w-3.5 border border-black/10" style={{ background: THICK }} />
                  <span className="h-3.5 w-3.5 border border-black/10" style={{ background: THIN }} />
                </span>
                <span>
                  <strong className="font-semibold">Ground</strong> stays ground. It becomes a wing
                  when it touches at least one head and one tail. It becomes a head when it touches
                  at least one head and two wings.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-black/10" style={{ background: HEAD_COLOR }} />
                <span>
                  <strong className="font-semibold">Head</strong> stays a head. It becomes a tail
                  when it touches at least one wing.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-black/10" style={{ background: TAIL_COLOR }} />
                <span>
                  <strong className="font-semibold">Tail</strong> always becomes a wing on the next
                  step.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 h-3.5 w-3.5 shrink-0 border border-black/10" style={{ background: WING_COLOR }} />
                <span>
                  <strong className="font-semibold">Wing</strong> always returns to ground on the
                  next step.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
