'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ASTEROID_MAX,
  ASTEROID_SIZE,
  ASTEROID_SPRITE,
  applyPointerVelocity,
  clampThrow,
  createRock,
  pushPointerSample,
  hitTest,
  isHardUI,
  isIBeamAt,
  measureWalls,
  resolveHeldKnocks,
  stepRocks,
  type AABB,
  type PointerSample,
  type Rock,
} from '@/lib/asteroids'

function paintRock(el: HTMLImageElement, rock: Rock) {
  const half = ASTEROID_SIZE / 2
  el.style.transform = `translate3d(${rock.x - half}px, ${rock.y - half}px, 0) rotate(${rock.angle}rad)`
}

export default function AsteroidField() {
  const [ids, setIds] = useState<number[]>([])
  const rocksRef = useRef<Rock[]>([])
  const imgsRef = useRef(new Map<number, HTMLImageElement>())
  const heldIdRef = useRef<number | null>(null)
  const heldPointerRef = useRef<number | null>(null)
  const nextId = useRef(1)
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const samplesRef = useRef<PointerSample[]>([])
  const lastHeldTRef = useRef(0)
  const runningRef = useRef(false)
  const prevWallsRef = useRef<AABB[]>([])
  const scrollingRef = useRef(false)

  const paint = () => {
    for (const rock of rocksRef.current) {
      const el = imgsRef.current.get(rock.id)
      if (el) paintRock(el, rock)
    }
  }

  const kick = () => {
    if (runningRef.current) return
    runningRef.current = true
    lastRef.current = performance.now()
    rafRef.current = requestAnimationFrame(loop)
  }

  const loop = (now: number) => {
    const dt = Math.min(0.032, (now - (lastRef.current || now)) / 1000)
    lastRef.current = now
    const walls = measureWalls()
    stepRocks(
      rocksRef.current,
      dt,
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      walls,
      prevWallsRef.current,
    )
    prevWallsRef.current = walls
    paint()
    const active = rocksRef.current.some(
      (r) => r.held || Math.hypot(r.vx, r.vy) > 0.4 || Math.abs(r.spin) > 0.02,
    )
    if (active || scrollingRef.current) {
      rafRef.current = requestAnimationFrame(loop)
    } else {
      runningRef.current = false
      rafRef.current = 0
    }
  }

  useEffect(() => {
    const endDragChrome = () => {
      document.body.style.userSelect = ''
      document.documentElement.style.cursor = ''
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      if (heldIdRef.current != null) return
      if (isHardUI(e.target)) return

      const hit = hitTest(rocksRef.current, e.clientX, e.clientY)
      let rock: Rock | undefined = hit ?? undefined
      if (!rock) {
        if (isIBeamAt(e.clientX, e.clientY)) return
        if (rocksRef.current.length >= ASTEROID_MAX) {
          const victim = rocksRef.current
            .filter((r) => !r.held)
            .sort((a, b) => a.born - b.born)[0]
          if (!victim) return
          Object.assign(victim, createRock(victim.id, e.clientX, e.clientY))
          rock = victim
        } else {
          rock = createRock(nextId.current++, e.clientX, e.clientY)
          rocksRef.current = [...rocksRef.current, rock]
          setIds(rocksRef.current.map((r) => r.id))
        }
      }

      rock.held = true
      rock.x = e.clientX
      rock.y = e.clientY
      rock.px = e.clientX
      rock.py = e.clientY
      rock.vx = 0
      rock.vy = 0
      heldIdRef.current = rock.id
      heldPointerRef.current = e.pointerId
      const now = performance.now()
      lastHeldTRef.current = now
      samplesRef.current = [{ t: now, x: e.clientX, y: e.clientY }]
      document.body.style.userSelect = 'none'
      document.documentElement.style.cursor = 'grabbing'
      e.preventDefault()
      paint()
      kick()
    }

    const onMove = (e: PointerEvent) => {
      if (heldPointerRef.current !== e.pointerId) return
      const id = heldIdRef.current
      if (id == null) return
      const rock = rocksRef.current.find((r) => r.id === id)
      if (!rock) return

      const now = performance.now()
      const dt = Math.max(0.001, (now - (lastHeldTRef.current || now)) / 1000)
      const dx = e.clientX - rock.x
      const dy = e.clientY - rock.y
      rock.spin += (rock.vx * dy - rock.vy * dx) * 0.00035
      rock.px = rock.x
      rock.py = rock.y
      rock.x = e.clientX
      rock.y = e.clientY
      rock.vx = dx / dt
      rock.vy = dy / dt
      clampThrow(rock)
      lastHeldTRef.current = now
      pushPointerSample(samplesRef.current, { t: now, x: e.clientX, y: e.clientY })
      resolveHeldKnocks(rocksRef.current)
      rock.px = rock.x
      rock.py = rock.y
      if (e.cancelable) e.preventDefault()
      paint()
      kick()
    }

    const onUp = (e: PointerEvent) => {
      if (heldPointerRef.current !== e.pointerId) return
      const id = heldIdRef.current
      const rock = id == null ? undefined : rocksRef.current.find((r) => r.id === id)
      if (rock) {
        const now = performance.now()
        pushPointerSample(samplesRef.current, { t: now, x: e.clientX, y: e.clientY })
        applyPointerVelocity(rock, samplesRef.current, now)
        rock.held = false
        rock.x = e.clientX
        rock.y = e.clientY
      }
      samplesRef.current = []
      heldIdRef.current = null
      heldPointerRef.current = null
      endDragChrome()
      kick()
    }

    let scrollTimer = 0
    const onScroll = () => {
      scrollingRef.current = true
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        scrollingRef.current = false
      }, 140)
      kick()
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', kick)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', kick)
      window.clearTimeout(scrollTimer)
      cancelAnimationFrame(rafRef.current)
      runningRef.current = false
      endDragChrome()
    }
    // Mount-once effect: `kick` only touches refs, so its identity is
    // irrelevant — re-subscribing on every render would be the real bug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden bg-transparent" aria-hidden>
      {ids.map((id) => (
        // Native img keeps the PNG alpha; Next/Image can flatten it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          ref={(el) => {
            if (el) {
              imgsRef.current.set(id, el)
              const rock = rocksRef.current.find((r) => r.id === id)
              if (rock) paintRock(el, rock)
            } else {
              imgsRef.current.delete(id)
            }
          }}
          src={ASTEROID_SPRITE}
          alt=""
          draggable={false}
          decoding="async"
          width={ASTEROID_SIZE}
          height={ASTEROID_SIZE}
          className="absolute top-0 left-0 max-w-none bg-transparent"
          style={{
            width: ASTEROID_SIZE,
            height: ASTEROID_SIZE,
            background: 'transparent',
            pointerEvents: 'none',
            userSelect: 'none',
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  )
}
