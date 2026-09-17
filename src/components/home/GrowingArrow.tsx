'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface Props {
  d: string
  duration: number
  id: string
  /** Short cyan stem at the start of the path (hero only). */
  stem?: boolean
}

const ARROW = '#f4d020'
const STEM = 'rgb(24, 118, 158)'

function tipFromPath(path: SVGPathElement, dist: number, len: number) {
  const look = Math.max(8, Math.min(18, len * 0.02))
  const b = path.getPointAtLength(Math.min(len, dist))
  const a = path.getPointAtLength(Math.max(0, Math.min(len, dist) - look))
  const dx = b.x - a.x
  const dy = b.y - a.y
  const angle = dx * dx + dy * dy > 0.2 ? Math.atan2(dy, dx) : null
  return { x: b.x, y: b.y, angle }
}

export default function GrowingArrow({ d, duration, id, stem = false }: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const angleRef = useRef(0)
  const [len, setLen] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tip, setTip] = useState({ x: 0, y: 0, angle: 0 })
  const [stemEnds, setStemEnds] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(
    null,
  )
  const gradId = `stem-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`

  useLayoutEffect(() => {
    const p = pathRef.current
    if (!p || !d) return
    const L = p.getTotalLength()
    setLen(L)
    setProgress(0)
    const t = tipFromPath(p, 0, L)
    if (t.angle != null) angleRef.current = t.angle
    setTip({ x: t.x, y: t.y, angle: angleRef.current })
    if (stem && L > 0) {
      const a = p.getPointAtLength(0)
      const b = p.getPointAtLength(Math.min(L, Math.min(38, Math.max(18, L * 0.045))))
      setStemEnds({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    } else {
      setStemEnds(null)
    }
  }, [d, stem])

  useEffect(() => {
    if (!len || !d) return
    let start: number | null = null
    let raf = 0
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
    const tick = (now: number) => {
      if (start == null) start = now
      const u = Math.min(1, (now - start) / duration)
      const e = ease(u)
      const p = pathRef.current
      if (p) {
        const next = tipFromPath(p, e * len, len)
        if (next.angle != null) angleRef.current = next.angle
        setTip({ x: next.x, y: next.y, angle: angleRef.current })
      }
      setProgress(e)
      if (u < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [len, duration, d])

  if (!d) return null

  const deg = (tip.angle * 180) / Math.PI
  const drawn = (len || 1) * progress
  const stemLen = Math.min(38, Math.max(18, (len || 1) * 0.045))
  const stemDrawn = Math.min(drawn, stemLen)

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={ARROW}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len || 1}
        strokeDashoffset={(len || 1) * (1 - progress)}
      />
      {stem && stemDrawn > 0.5 && stemEnds ? (
        <>
          <defs>
            <linearGradient
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1={stemEnds.x1}
              y1={stemEnds.y1}
              x2={stemEnds.x2}
              y2={stemEnds.y2}
            >
              <stop offset="0%" stopColor={STEM} />
              <stop offset="50%" stopColor={STEM} />
              <stop offset="100%" stopColor={ARROW} />
            </linearGradient>
          </defs>
          <path
            d={d}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${stemDrawn} ${(len || 1) * 4}`}
            strokeDashoffset={0}
          />
        </>
      ) : null}
      <g transform={`translate(${tip.x} ${tip.y}) rotate(${deg})`} aria-hidden>
        <path
          d="M -13 -8.5 L 0 0 L -13 8.5"
          fill="none"
          stroke={ARROW}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <title>{id}</title>
    </g>
  )
}
