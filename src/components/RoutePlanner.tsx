import React, { useState } from 'react'
import {
  Navigation, MapPin, Clock, Cloud, Gauge,
  AlertTriangle, CheckCircle, ChevronDown, Loader2,
  ArrowRight, Shield,
} from 'lucide-react'
import { usePredictRoute } from '../hooks/useApi'
import type { RouteResponse, RouteAlternative } from '../types'
import {
  NAMED_LOCATIONS, WEATHER_OPTIONS, TIME_OPTIONS, TRAFFIC_OPTIONS,
} from '../types'
import RiskBadge from './RiskBadge'
import RiskMeter from './RiskMeter'

interface Props {
  onRouteResult:  (res: RouteResponse) => void
  onRouteSelect:  (id: string) => void
  activeRouteId:  string | null
  routeResult:    RouteResponse | null
}

export default function RoutePlanner({
  onRouteResult, onRouteSelect, activeRouteId, routeResult,
}: Props) {
  const [originLabel,  setOriginLabel]  = useState('')
  const [destLabel,    setDestLabel]    = useState('')
  const [weather,      setWeather]      = useState('Clear')
  const [timeOfDay,    setTimeOfDay]    = useState('Morning')
  const [traffic,      setTraffic]      = useState('Medium')

  const { call, loading, error } = usePredictRoute()

  const resolveCoords = (label: string) => {
    const found = NAMED_LOCATIONS.find(
      l => l.label.toLowerCase() === label.trim().toLowerCase()
    )
    if (found) return { lat: found.lat, lng: found.lng }
    // Try lat,lng format
    const parts = label.split(',').map(p => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]))
      return { lat: parts[0], lng: parts[1] }
    return null
  }

  const handleSubmit = async () => {
    const origin = resolveCoords(originLabel)
    const dest   = resolveCoords(destLabel)

    if (!origin) { alert('Could not resolve origin. Use a named location or lat,lng'); return }
    if (!dest)   { alert('Could not resolve destination. Use a named location or lat,lng'); return }

    const result = await call({
      origin_lat:      origin.lat,
      origin_lng:      origin.lng,
      dest_lat:        dest.lat,
      dest_lng:        dest.lng,
      preferred_time:  timeOfDay,
      weather,
      traffic_density: traffic,
    })
    if (result) {
      onRouteResult(result)
      onRouteSelect(result.safest_route.route_id)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">

      {/* ── Form ── */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold flex items-center gap-2 text-teal-400">
          <Navigation size={16} /> Route Planner
        </h2>

        {/* Origin */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
            <MapPin size={12} className="text-teal-400" /> Origin
          </label>
          <LocationInput
            value={originLabel}
            onChange={setOriginLabel}
            placeholder="e.g. Peddapalli Town"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
            <MapPin size={12} className="text-purple-400" /> Destination
          </label>
          <LocationInput
            value={destLabel}
            onChange={setDestLabel}
            placeholder="e.g. Ramagundam"
          />
        </div>

        {/* Conditions row */}
        <div className="grid grid-cols-3 gap-2">
          <SelectField
            label="Weather"
            icon={<Cloud size={11} />}
            value={weather}
            onChange={setWeather}
            options={WEATHER_OPTIONS}
          />
          <SelectField
            label="Time"
            icon={<Clock size={11} />}
            value={timeOfDay}
            onChange={setTimeOfDay}
            options={TIME_OPTIONS}
          />
          <SelectField
            label="Traffic"
            icon={<Gauge size={11} />}
            value={traffic}
            onChange={setTraffic}
            options={TRAFFIC_OPTIONS}
          />
        </div>

        {/* Quick location chips */}
        <div>
          <p className="text-xs text-slate-500 mb-1.5">Quick select:</p>
          <div className="flex flex-wrap gap-1.5">
            {NAMED_LOCATIONS.slice(0, 6).map(loc => (
              <button
                key={loc.label}
                onClick={() => {
                  if (!originLabel) setOriginLabel(loc.label)
                  else if (!destLabel) setDestLabel(loc.label)
                  else setDestLabel(loc.label)
                }}
                className="text-xs px-2 py-1 rounded bg-night-700 hover:bg-night-600
                           border border-night-600 hover:border-teal-500/40
                           text-slate-300 hover:text-teal-300 transition-all"
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !originLabel || !destLabel}
          className="btn-primary w-full mt-1"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Calculating routes…</>
          ) : (
            <><Shield size={16} /> Find Safest Route</>
          )}
        </button>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20
                          rounded-lg px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {routeResult && (
        <RouteResults
          result={routeResult}
          activeRouteId={activeRouteId}
          onRouteSelect={onRouteSelect}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LocationInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const filtered = NAMED_LOCATIONS.filter(
    l => l.label.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div className="relative">
      <input
        className="input-dark"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
      />
      {open && value && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1
                        bg-night-800 border border-night-700 rounded-lg
                        shadow-xl overflow-hidden">
          {filtered.slice(0, 6).map(loc => (
            <button
              key={loc.label}
              onMouseDown={() => { onChange(loc.label); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-night-700
                         text-slate-300 hover:text-white transition-colors
                         flex items-center gap-2"
            >
              <MapPin size={12} className="text-teal-400 shrink-0" />
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SelectField({ label, icon, value, onChange, options }: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; options: string[]
}) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="input-dark appearance-none pr-7 text-xs cursor-pointer"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2
                                           pointer-events-none text-slate-500" />
      </div>
    </div>
  )
}

// ── Route results panel ───────────────────────────────────────────────────────
function RouteResults({
  result, activeRouteId, onRouteSelect,
}: {
  result: RouteResponse; activeRouteId: string | null; onRouteSelect: (id: string) => void
}) {
  const allRoutes = [result.safest_route, ...result.alternatives]

  return (
    <div className="flex flex-col gap-3 animate-fade-in">

      {/* Summary card */}
      <div className="glass-card p-4 border-teal-500/20 glow-teal">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-teal-400 font-display font-semibold text-sm mb-1">
              <CheckCircle size={14} /> Safest Route Found
            </div>
            <div className="text-xs text-slate-400">
              {result.origin_label} <ArrowRight size={10} className="inline" /> {result.destination_label}
            </div>
          </div>
          <RiskMeter score={result.safest_route.overall_risk} size={80} />
        </div>
        <p className="text-xs text-slate-300 leading-relaxed bg-night-900/60 rounded-lg p-2.5">
          {result.analysis_summary}
        </p>
      </div>

      {/* Route comparison */}
      <div className="glass-card p-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Route Comparison
        </h3>
        <div className="flex flex-col gap-2">
          {allRoutes.map((route, i) => (
            <RouteCard
              key={route.route_id}
              route={route}
              rank={i + 1}
              isActive={route.route_id === activeRouteId}
              onSelect={() => onRouteSelect(route.route_id)}
            />
          ))}
        </div>
      </div>

      {/* Segment detail for active route */}
      {allRoutes.find(r => r.route_id === activeRouteId) && (
        <SegmentDetail
          route={allRoutes.find(r => r.route_id === activeRouteId)!}
        />
      )}
    </div>
  )
}

function RouteCard({
  route, rank, isActive, onSelect,
}: {
  route: RouteAlternative; rank: number; isActive: boolean; onSelect: () => void
}) {
  const riskColor =
    route.overall_risk < 0.35 ? 'text-green-400'
    : route.overall_risk < 0.60 ? 'text-amber-400'
    : 'text-red-400'

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-lg p-2.5 transition-all border
        ${isActive
          ? 'bg-teal-500/10 border-teal-500/40'
          : 'bg-night-900/40 border-night-700/40 hover:border-night-600'
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">#{rank}</span>
          <span className="text-sm font-medium text-slate-200">{route.label}</span>
          {route.is_recommended && (
            <span className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30
                             px-1.5 py-0.5 rounded-full">
              ✓ Recommended
            </span>
          )}
        </div>
        <RiskBadge level={riskLevelFromScore(route.overall_risk)} score={route.overall_risk} size="sm" />
      </div>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
        <span>{route.estimated_km} km</span>
        <span>·</span>
        <span>{route.segments.length} segments</span>
        {route.high_risk_count > 0 && (
          <>
            <span>·</span>
            <span className="text-orange-400 flex items-center gap-1">
              <AlertTriangle size={10} /> {route.high_risk_count} high-risk
            </span>
          </>
        )}
      </div>
    </button>
  )
}

function SegmentDetail({ route }: { route: RouteAlternative }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="glass-card p-3">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between text-xs font-semibold
                   text-slate-400 uppercase tracking-wider mb-1"
      >
        <span>Segment Breakdown — {route.label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="flex flex-col gap-1.5 mt-2 max-h-64 overflow-y-auto">
          {route.segments.map((seg, i) => (
            <div
              key={i}
              className={`rounded-lg px-2.5 py-2 text-xs border
                ${seg.risk_level === 'Critical' ? 'bg-red-500/10 border-red-500/20'
                  : seg.risk_level === 'High'     ? 'bg-orange-500/10 border-orange-500/20'
                  : seg.risk_level === 'Medium'   ? 'bg-amber-500/10 border-amber-500/20'
                  : 'bg-green-500/10 border-green-500/20'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200 truncate max-w-[60%]">
                  {seg.road_name}
                </span>
                <RiskBadge level={seg.risk_level} score={seg.risk_score} size="sm" />
              </div>
              {seg.warning && (
                <div className="text-amber-400 mt-1 flex items-start gap-1">
                  <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                  <span>{seg.warning}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function riskLevelFromScore(s: number): string {
  if (s < 0.30) return 'Low'
  if (s < 0.55) return 'Medium'
  if (s < 0.75) return 'High'
  return 'Critical'
}
