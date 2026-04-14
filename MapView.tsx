import React, { useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { RouteAlternative, HotspotPoint } from '../types'
import RiskBadge from './RiskBadge'

// ── Heatmap layer via leaflet.heat ────────────────────────────────────────────
function HeatmapLayer({ hotspots }: { hotspots: HotspotPoint[] }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (!hotspots.length) return
    // Dynamically load leaflet.heat
    import('leaflet' as never).then(() => {
      const L2 = L as L.Map & { heatLayer?: (...args: unknown[]) => L.Layer }
      if (typeof (L as unknown as Record<string, unknown>).heatLayer !== 'function') return

      const points = hotspots.map(h => [h.latitude, h.longitude, h.risk_score * 1.5])
      if (layerRef.current) map.removeLayer(layerRef.current)
      const heat = (L as unknown as { heatLayer: (pts: unknown[], opts: unknown) => L.Layer })
        .heatLayer(points, {
          radius: 28,
          blur: 20,
          maxZoom: 15,
          gradient: { 0.3: '#22c55e', 0.55: '#f59e0b', 0.75: '#f97316', 1.0: '#ef4444' },
        })
        .addTo(map)
      layerRef.current = heat
    })
    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [hotspots, map])

  return null
}

// ── Auto-fit bounds ───────────────────────────────────────────────────────────
function FitBounds({ route }: { route: RouteAlternative | null }) {
  const map = useMap()
  useEffect(() => {
    if (!route) return
    const coords = route.segments.flatMap(s => [
      [s.from_lat, s.from_lng] as [number, number],
      [s.to_lat,   s.to_lng]   as [number, number],
    ])
    if (coords.length) map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })
  }, [route, map])
  return null
}

// ── Segment colour by risk ───────────────────────────────────────────────────
function segmentColor(level: string): string {
  switch (level) {
    case 'Low':      return '#22c55e'
    case 'Medium':   return '#f59e0b'
    case 'High':     return '#f97316'
    case 'Critical': return '#ef4444'
    default:         return '#3b82f6'
  }
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  safestRoute:    RouteAlternative | null
  alternatives:   RouteAlternative[]
  hotspots:       HotspotPoint[]
  showHeatmap:    boolean
  showHotspots:   boolean
  activeRouteId:  string | null
  onRouteSelect:  (id: string) => void
}

const PEDDAPALLI: [number, number] = [18.616, 79.383]

export default function MapView({
  safestRoute, alternatives, hotspots,
  showHeatmap, showHotspots, activeRouteId, onRouteSelect,
}: Props) {
  const allRoutes = safestRoute
    ? [safestRoute, ...alternatives]
    : alternatives

  return (
    <MapContainer
      center={PEDDAPALLI}
      zoom={11}
      className="w-full h-full rounded-xl overflow-hidden"
      zoomControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        maxZoom={18}
      />

      {/* Heatmap */}
      {showHeatmap && hotspots.length > 0 && (
        <HeatmapLayer hotspots={hotspots} />
      )}

      {/* Hotspot markers */}
      {showHotspots && hotspots.slice(0, 40).map((h, i) => (
        <CircleMarker
          key={i}
          center={[h.latitude, h.longitude]}
          radius={5 + h.risk_score * 6}
          pathOptions={{
            color:       h.risk_score > 0.7 ? '#ef4444' : '#f59e0b',
            fillColor:   h.risk_score > 0.7 ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.6,
            weight:      1.5,
          }}
        >
          <Popup>
            <div className="text-night-900 text-xs font-body">
              <div className="font-semibold mb-1">{h.road_name}</div>
              <div>Risk: <strong>{h.risk_score.toFixed(3)}</strong></div>
              <div>Incidents: {h.incident_count}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Alternative routes (dimmed, behind) */}
      {allRoutes.filter(r => r.route_id !== (activeRouteId ?? safestRoute?.route_id))
        .map(route => (
          route.segments.map((seg, i) => (
            <Polyline
              key={`${route.route_id}-${i}`}
              positions={[[seg.from_lat, seg.from_lng], [seg.to_lat, seg.to_lng]]}
              pathOptions={{ color: '#475569', weight: 3, opacity: 0.4, dashArray: '6 4' }}
              eventHandlers={{ click: () => onRouteSelect(route.route_id) }}
            />
          ))
        ))
      }

      {/* Active / safest route — coloured by risk */}
      {allRoutes
        .filter(r => r.route_id === (activeRouteId ?? safestRoute?.route_id))
        .map(route =>
          route.segments.map((seg, i) => (
            <Polyline
              key={`active-${route.route_id}-${i}`}
              positions={[[seg.from_lat, seg.from_lng], [seg.to_lat, seg.to_lng]]}
              pathOptions={{
                color:   segmentColor(seg.risk_level),
                weight:  6,
                opacity: 0.92,
                lineCap: 'round',
              }}
            >
              <Popup>
                <div className="text-xs font-body min-w-[160px]">
                  <div className="font-semibold text-sm mb-1">{seg.road_name}</div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: segmentColor(seg.risk_level) }}
                    />
                    <span>{seg.risk_level} risk ({seg.risk_score.toFixed(3)})</span>
                  </div>
                  {seg.warning && (
                    <div className="text-amber-600 text-xs mt-1">⚠ {seg.warning}</div>
                  )}
                </div>
              </Popup>
            </Polyline>
          ))
        )
      }

      {/* Origin / Destination markers */}
      {safestRoute && safestRoute.segments.length > 0 && (() => {
        const first = safestRoute.segments[0]
        const last  = safestRoute.segments[safestRoute.segments.length - 1]
        return (
          <>
            <CircleMarker
              center={[first.from_lat, first.from_lng]}
              radius={10}
              pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 1, weight: 3 }}
            >
              <Popup><div className="text-xs font-semibold">📍 Origin</div></Popup>
            </CircleMarker>
            <CircleMarker
              center={[last.to_lat, last.to_lng]}
              radius={10}
              pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 1, weight: 3 }}
            >
              <Popup><div className="text-xs font-semibold">🏁 Destination</div></Popup>
            </CircleMarker>
          </>
        )
      })()}

      {safestRoute && <FitBounds route={safestRoute} />}
    </MapContainer>
  )
}
