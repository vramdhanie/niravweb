'use client'

export type Axis = 0 | 1 | 2

export interface PlaneSets {
  yz: Set<number> // planes perpendicular to X (indexed by i)
  xz: Set<number> // perpendicular to Y (j)
  xy: Set<number> // perpendicular to Z (k)
}

const ROWS: { axis: Axis; label: string; key: keyof PlaneSets }[] = [
  { axis: 0, label: 'X · yz planes', key: 'yz' },
  { axis: 1, label: 'Y · xz planes', key: 'xz' },
  { axis: 2, label: 'Z · xy planes', key: 'xy' },
]

interface Props {
  resolution: number
  sets: PlaneSets
  onToggle: (axis: Axis, index: number) => void
  onAll: (axis: Axis, on: boolean) => void
  onPreview: (p: { axis: Axis; index: number } | null) => void
}

export default function PlanePicker({ resolution, sets, onToggle, onAll, onPreview }: Props) {
  return (
    <div className="space-y-2.5">
      {ROWS.map(({ axis, label, key }) => {
        const set = sets[key]
        return (
          <div key={axis}>
            <div className="mb-1 flex items-center justify-between text-[11px] text-white/60">
              <span className="font-medium">{label}</span>
              <span className="flex gap-2">
                <button className="hover:text-white" onClick={() => onAll(axis, true)}>
                  all
                </button>
                <button className="hover:text-white" onClick={() => onAll(axis, false)}>
                  none
                </button>
              </span>
            </div>
            <div className="flex gap-px" onMouseLeave={() => onPreview(null)}>
              {Array.from({ length: resolution }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${label} plane ${i}`}
                  onClick={() => onToggle(axis, i)}
                  onMouseEnter={() => onPreview({ axis, index: i })}
                  className={`h-5 flex-1 rounded-[1px] transition-colors ${
                    set.has(i) ? 'bg-[var(--secondary)]' : 'bg-white/10 hover:bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] leading-snug text-white/45">
        Visible points are the union of the enabled planes. Hover a strip to preview a single plane.
      </p>
    </div>
  )
}
