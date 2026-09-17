'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Sparkles, Play } from 'lucide-react'

const BasinsViewer = dynamic(() => import('./BasinsViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-white/10 bg-[#080a0f] text-sm text-white/60">
      Loading visualizer…
    </div>
  ),
})

export default function VisualizerSection() {
  const [launched, setLaunched] = useState(false)

  return (
    <div data-asteroid-wall>
      {launched ? (
        <BasinsViewer />
      ) : (
        <button
          type="button"
          onClick={() => setLaunched(true)}
          className="group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[color:rgba(0,0,0,0.15)] bg-white transition-colors hover:border-[var(--secondary)]"
        >
          <Sparkles size={32} className="text-[var(--primary-light)] opacity-50 transition-opacity group-hover:opacity-90" />
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-dark)] px-5 py-2 font-medium text-white transition-transform group-hover:scale-105">
            <Play size={16} />
            Launch interactive visualizer
          </span>
          <span className="text-xs text-[var(--primary-light)]">
            Explore the 4-D collision basins in your browser · WebGL · ~6 MB
          </span>
        </button>
      )}
    </div>
  )
}
