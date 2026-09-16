'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface Props {
  d: string
  duration: number
  id: string
}

function tipFromPath(path: SVGPathElement, dist: number, len: number) {
  const look = Math.max(8, Math.min(18, len * 0.02))
  const b = path.getPointAtLength(Math.min(len, dist))
  const a = path.getPointAtLength(Math.max(0, Math.min(len, dist) - look))
  const dx = b.x - a.x
  const dy = b.y - a.y
  const angle = dx * dx + dy * dy > 0.2 ? Math.atan2(dy, dx) : null
  return { x: b.x, y: b.y, angle }
}

export default function GrowingArrow({ d, duration, id }: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const angleRef = useRef(0)
  const [len, setLen] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tip, setTip] = useState({ x: 0, y: 0, angle: 0 })

  useLayoutEffect(() => {
    const p = pathRef.current
    if (!p || !d) return
    const L = p.getTotalLength()
    setLen(L)
    setProgress(0)
    const t = tipFromPath(p, 0, L)
    if (t.angle != null) angleRef.current = t.angle
    setTip({ x: t.x, y: t.y, angle: angleRef.current })
  }, [d])

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

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="rgba(0,0,0,0.45)"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len || 1}
        strokeDashoffset={(len || 1) * (1 - progress)}
      />
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth={2.15}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len || 1}
        strokeDashoffset={(len || 1) * (1 - progress)}
      />
      <g transform={`translate(${tip.x} ${tip.y}) rotate(${deg})`} aria-hidden>
        <polygon points="0,0 -14,-6.5 -11,0 -14,6.5" fill="rgba(0,0,0,0.45)" />
        <polygon points="1,0 -12,-5 -10,0 -12,5" fill="white" />
      </g>
      <title>{id}</title>
    </g>
  )
}
