'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

const SRC = '/Videos/Physics-Engine/0048-0600.webm'

// 1920×1156, transparent. The cube stays on the first frame while the
// page scrolls, and that frame's landing line meets the footer.
const FRAME_W = 1920
const FRAME_H = 1156
const FALL_TOP = 0.131
const FALL_BOTTOM = 0.359
const FALL_LEFT = 0.375
const FALL_RIGHT = 0.498
const IMPACT_BOTTOM = 0.945
// Spin around the cube, not the video frame. 0° is the clip's own orientation.
const CUBE_X = (FALL_LEFT + FALL_RIGHT) / 2
const CUBE_Y = (FALL_TOP + FALL_BOTTOM) / 2
const START_ROTATION = -90

// Step backward one displayed slice at a time and wait until that frame
// has decoded. Chaining seeks without waiting is what made the clip jump.
const REWIND_STEP = 0.32
const REWIND_GAP = 2
const RISE_MS = 420

interface Rewind {
  notBefore: number
  pending: boolean
}

interface Props {
  trackRef: RefObject<HTMLElement | null>
}

export default function FallingCube({ trackRef }: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [placed, setPlaced] = useState(false)

  useLayoutEffect(() => {
    const frame = frameRef.current
    const video = videoRef.current
    // The parent ref is not assigned yet while this layout effect runs.
    if (!frame || !video) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    let mode: 'fall' | 'play' | 'rewind' | 'rise' = 'fall'
    let footerOnScreen = false
    let appliedTop = 0
    let appliedRot = Number.NaN
    let rewind: Rewind | null = null
    let rewindToken = 0
    let rise: { fromTop: number; fromRot: number; start: number; duration: number } | null = null
    let raf = 0
    let paintedSize = ''

    const metrics = () => {
      const nav = document.querySelector('nav')
      const navH = nav ? nav.getBoundingClientRect().height : 88
      const footer = document.querySelector('footer')
      const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight
      const footerDoc = footerTop + window.scrollY
      const revealAt = Math.max(1, footerDoc - window.innerHeight)
      const viewH = Math.min(window.innerHeight * 0.9, 760)
      const viewW = FRAME_W * (viewH / FRAME_H)
      const cubeTopGap = (FALL_BOTTOM - FALL_TOP) * viewH
      const startFrameTop = navH + 8 + cubeTopGap - FALL_BOTTOM * viewH
      const bar = Math.min(window.innerHeight, footerTop)
      const approachLock = bar - IMPACT_BOTTOM * viewH
      // Glued to the footer itself, including once that bar has left the viewport.
      const pageLockTop = footerTop - IMPACT_BOTTOM * viewH
      const along = Math.min(1, Math.max(0, window.scrollY / revealAt))
      return {
        viewW,
        viewH,
        footerTop,
        startFrameTop,
        pageLockTop,
        fallTop: startFrameTop + along * (approachLock - startFrameTop),
        fallRotation: START_ROTATION * (1 - along),
        left: 40 - FALL_LEFT * viewW,
      }
    }

    const bottomVisible = (footerTop: number) => {
      if (footerOnScreen) footerOnScreen = footerTop < window.innerHeight + 48
      else footerOnScreen = footerTop < window.innerHeight - 2
      return footerOnScreen
    }

    const apply = (top: number, viewW: number, viewH: number, left: number, rot: number) => {
      const topR = Math.round(top)
      const rotR = Math.round(rot * 10) / 10
      const sizeKey = `${Math.round(viewW)}|${Math.round(viewH)}|${Math.round(left)}`
      if (sizeKey !== paintedSize) {
        paintedSize = sizeKey
        frame.style.width = `${viewW}px`
        frame.style.height = `${viewH}px`
        frame.style.left = `${left}px`
        frame.style.top = '0px'
        frame.style.transformOrigin = `${CUBE_X * 100}% ${CUBE_Y * 100}%`
      }
      if (topR === appliedTop && rotR === appliedRot && frame.style.transform) return
      appliedTop = topR
      appliedRot = rotR
      frame.style.transform = `translate3d(0, ${topR}px, 0) rotate(${rotR}deg)`
    }

    const startPlayback = () => {
      if (video.ended || !video.paused) return
      video.playbackRate = 1
      void video.play().catch(() => {
        mode = 'fall'
      })
    }

    const enterPlay = () => {
      const seekInFlight = Boolean(rewind?.pending)
      rewindToken += 1
      mode = 'play'
      rewind = null
      rise = null
      video.playbackRate = 1
      if (!seekInFlight) startPlayback()
    }

    const beginRise = () => {
      rewind = null
      mode = 'rise'
      rise = { fromTop: appliedTop, fromRot: appliedRot || 0, start: performance.now(), duration: 0 }
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const enterRewind = () => {
      video.pause()
      rewindToken += 1
      if (video.currentTime <= 0.03) {
        beginRise()
        return
      }
      mode = 'rewind'
      rise = null
      rewind = { notBefore: 0, pending: false }
    }

    const pumpRewind = () => {
      if (mode !== 'rewind' || !rewind || rewind.pending) return
      const now = performance.now()
      if (now < rewind.notBefore) return
      const cur = video.currentTime
      if (cur <= 0.02) {
        beginRise()
        return
      }
      const dest = Math.max(0, cur - REWIND_STEP)
      const token = rewindToken
      rewind.pending = true
      rewind.notBefore = now + REWIND_GAP
      let settled = false
      let timeout = 0
      const finishStep = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        if (token !== rewindToken) {
          if (mode === 'play') startPlayback()
          return
        }
        if (rewind) rewind.pending = false
        if (mode !== 'rewind') return
        if (video.currentTime <= 0.02) beginRise()
        else if (!raf) raf = requestAnimationFrame(loop)
      }
      timeout = window.setTimeout(finishStep, 400)
      video.addEventListener('seeked', finishStep, { once: true })
      video.currentTime = dest
    }

    const layout = () => {
      const m = metrics()
      const visible = bottomVisible(m.footerTop)

      if (reduce.matches) {
        video.pause()
        rewindToken += 1
        mode = 'fall'
        footerOnScreen = false
        rewind = null
        rise = null
        apply(m.startFrameTop, m.viewW, m.viewH, m.left, START_ROTATION)
        return
      }

      if (mode === 'rewind') {
        if (visible) {
          enterPlay()
          apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
          return
        }
        apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
        pumpRewind()
        return
      }

      if (mode === 'rise' && rise) {
        if (visible) {
          rise = null
          enterPlay()
          apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
          return
        }
        if (!rise.duration) {
          const travel = Math.abs(m.fallTop - rise.fromTop)
          rise.duration = Math.min(900, Math.max(RISE_MS, travel * 0.6))
          rise.start = performance.now()
        }
        const u = Math.min(1, (performance.now() - rise.start) / rise.duration)
        const k = 1 - (1 - u) ** 3
        apply(
          rise.fromTop + (m.fallTop - rise.fromTop) * k,
          m.viewW,
          m.viewH,
          m.left,
          rise.fromRot + (m.fallRotation - rise.fromRot) * k,
        )
        if (u >= 1) {
          rise = null
          mode = 'fall'
        }
        return
      }

      if (mode === 'play') {
        if (!visible) {
          enterRewind()
          apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
          return
        }
        apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
        return
      }

      if (visible) {
        apply(m.pageLockTop, m.viewW, m.viewH, m.left, 0)
        enterPlay()
        return
      }
      apply(m.fallTop, m.viewW, m.viewH, m.left, m.fallRotation)
    }

    const loop = () => {
      raf = 0
      layout()
      if (mode === 'rewind' || mode === 'rise') raf = requestAnimationFrame(loop)
    }

    const requestUpdate = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }

    const onReady = () => {
      video.pause()
      video.playbackRate = 1
      if (video.currentTime > 0.03) video.currentTime = 0
      requestUpdate()
    }

    video.addEventListener('loadeddata', onReady)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    reduce.addEventListener('change', requestUpdate)
    // Place it before the first paint. A later animation frame is the flash.
    layout()
    setPlaced(true)
    if (video.readyState >= 2) {
      video.pause()
      video.playbackRate = 1
      if (video.currentTime > 0.03) video.currentTime = 0
    }

    return () => {
      rewindToken += 1
      video.removeEventListener('loadeddata', onReady)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      reduce.removeEventListener('change', requestUpdate)
      if (raf) cancelAnimationFrame(raf)
      video.pause()
    }
  }, [trackRef, REWIND_STEP, REWIND_GAP, RISE_MS, START_ROTATION])

  return (
    <div
      ref={frameRef}
      className="pointer-events-none fixed z-[80] will-change-transform"
      style={{ visibility: placed ? 'visible' : 'hidden' }}
      aria-hidden
    >
      <video
        ref={videoRef}
        className="h-full w-full max-w-none"
        src={SRC}
        muted
        playsInline
        preload="auto"
      />
    </div>
  )
}
