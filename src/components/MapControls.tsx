import React from 'react'
import { Layers, Eye, EyeOff } from 'lucide-react'

interface Props {
  showHeatmap:      boolean
  onToggleHeatmap:  () => void
  showHotspots:     boolean
  onToggleHotspots: () => void
}

export default function MapControls({
  showHeatmap, onToggleHeatmap,
  showHotspots, onToggleHotspots,
}: Props) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
      <div className="glass-card p-2 flex flex-col gap-1.5">
        <div className="text-xs text-slate-500 flex items-center gap-1 px-1">
          <Layers size={10} /> Layers
        </div>
        <ToggleRow label="Heatmap"  active={showHeatmap}  onClick={onToggleHeatmap} />
        <ToggleRow label="Hotspots" active={showHotspots} onClick={onToggleHotspots} />
      </div>

      {/* Legend */}
      <div className="glass-card p-2">
        <div className="text-xs text-slate-500 mb-1.5 px-1">Risk Colours</div>
        {[
          { color: '#22c55e', label: 'Low'      },
          { color: '#f59e0b', label: 'Medium'   },
          { color: '#f97316', label: 'High'     },
          { color: '#ef4444', label: 'Critical' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 py-0.5">
            <span className="w-3.5 h-1.5 rounded-full" style={{ background: item.color }} />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToggleRow({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors
        ${active ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
      {active ? <Eye size={11} /> : <EyeOff size={11} />}
      {label}
    </button>
  )
}
