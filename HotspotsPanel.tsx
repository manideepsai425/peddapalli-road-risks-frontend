import React, { useEffect, useState } from 'react'
import { Flame, RefreshCw, AlertTriangle } from 'lucide-react'
import { fetchHotspots } from '../hooks/useApi'
import type { HotspotPoint } from '../types'
import RiskBadge from './RiskBadge'

interface Props {
  onHotspotsLoaded: (h: HotspotPoint[]) => void
  showHeatmap:      boolean
  onToggleHeatmap:  () => void
  showHotspots:     boolean
  onToggleHotspots: () => void
}

function riskLevel(s: number): string {
  if (s < 0.30) return 'Low'
  if (s < 0.55) return 'Medium'
  if (s < 0.75) return 'High'
  return 'Critical'
}

export default function HotspotsPanel({
  onHotspotsLoaded,
  showHeatmap,   onToggleHeatmap,
  showHotspots,  onToggleHotspots,
}: Props) {
  const [hotspots, setHotspots] = useState<HotspotPoint[]>([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const data = await fetchHotspots()
      setHotspots(data)
      onHotspotsLoaded(data)
    } catch (e: unknown) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-semibold flex items-center gap-2 text-orange-400">
            <Flame size={16} /> Accident Hotspots
          </h2>
          <button onClick={load} disabled={loading}
            className="p-1.5 rounded-lg bg-night-700 hover:bg-night-600 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : 'text-slate-400'} />
          </button>
        </div>

        {/* Layer toggles */}
        <div className="flex gap-2 mb-3">
          <ToggleBtn active={showHeatmap} onClick={onToggleHeatmap} label="🌡 Heatmap" />
          <ToggleBtn active={showHotspots} onClick={onToggleHotspots} label="📍 Markers" />
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2
                          flex items-center gap-2 mb-2">
            <AlertTriangle size={12} /> {error}
          </div>
        )}

        <div className="text-xs text-slate-500 mb-2">
          Showing top {hotspots.length} clustered risk zones (risk ≥ 0.55)
        </div>
      </div>

      {/* Hotspot list */}
      <div className="glass-card p-3">
        <div className="flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto">
          {hotspots.slice(0, 30).map((h, i) => (
            <div key={i}
              className={`rounded-lg p-2.5 border text-xs transition-all
                ${h.risk_score > 0.70
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-amber-500/10 border-amber-500/20'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-slate-200 truncate">{h.road_name}</div>
                  <div className="text-slate-500 font-mono mt-0.5">
                    {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <RiskBadge level={riskLevel(h.risk_score)} score={h.risk_score} size="sm" />
                  <span className="text-slate-500 text-xs">{h.incident_count} incidents</span>
                </div>
              </div>
            </div>
          ))}
          {!loading && hotspots.length === 0 && (
            <div className="text-slate-500 text-sm text-center py-8">
              No hotspot data. Make sure the backend is running.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToggleBtn({ active, onClick, label }: {
  active: boolean; onClick: () => void; label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium
        ${active
          ? 'bg-teal-500/20 border-teal-500/40 text-teal-400'
          : 'bg-night-700 border-night-600 text-slate-400 hover:border-night-500'
        }`}
    >
      {label}
    </button>
  )
}
