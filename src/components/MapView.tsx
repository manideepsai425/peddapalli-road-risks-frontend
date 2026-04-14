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

// ── Heatmap layer via leaflet.heat ────────────────────────────────────────────
type LeafletWithHeat = typeof L & { heatLayer: (pts: unknown[], opts: unknown) => L.Layer }

function HeatmapLayer({ hotspots }: { hotspots: HotspotPoint[] }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (!hotspots.length) return
    const LH = L as unknown as LeafletWithHeat
    if (typeof LH.heatLayer !== 'function') return
    const points = hotspots.map(h => [h.latitude, h.longitude, h.risk_score * 1.5])
    if (layerRef.current) map.removeLayer(layerRef.current)
    const heat = LH.heatLayer(points, {
      radius: 28, blur: 20, maxZoom: 15,
      gradient: { 0.3: '#22c55e', 0.55: '#f59e0b', 0.75: '#f97316', 1.0: '#ef4444' },
    }).addTo(map)
    layerRef.current = heat
    return () => { if (layerRef.current) map.removeLayer(layerRef.current) }
  }, [hotspots, map])

  return null
}

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

function segmentColor(level: string): string {
  switch (level) {
    case 'Low':      return '#22c55e'
    case 'Medium':   return '#f59e0b'
    case 'High':     return '#f97316'
    case 'Critical': return '#ef4444'
    default:         return '#3b82f6'
  }
}

interface Props {
  safestRoute:   RouteAlternative | null
  alternatives:  RouteAlternative[]
  hotspots:      HotspotPoint[]
  showHeatmap:   boolean
  showHotspots:  boolean
  activeRouteId: string | null
  onRouteSelect: (id: string) => void
}

const PEDDAPALLI: [number, number] = [18.616, 79.383]

export default function MapView({
  safestRoute, alternatives, hotspots,
  showHeatmap, showHotspots, activeRouteId, onRouteSelect,
}: Props) {
  const allRoutes = safestRoute ? [safestRoute, ...alternatives] : alternatives

  return (
    <MapContainer center={PEDDAPALLI} zoom={11}
      className="w-full h-full rounded-xl overflow-hidden" zoomControl>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        maxZoom={18}
      />

      {showHeatmap && hotspots.length > 0 && <HeatmapLayer hotspots={hotspots} />}

      {showHotspots && hotspots.slice(0, 40).map((h, i) => (
        <CircleMarker key={i} center={[h.latitude, h.longitude]}
          radius={5 + h.risk_score * 6}
          pathOptions={{
            color: h.risk_score > 0.7 ? '#ef4444' : '#f59e0b',
            fillColor: h.risk_score > 0.7 ? '#ef4444' : '#f59e0b',
            fillOpacity: 0.6, weight: 1.5,
          }}>
          <Popup>
            <div className="text-xs">
              <div className="font-semibold mb-1">{h.road_name}</div>
              <div>Risk: <strong>{h.risk_score.toFixed(3)}</strong></div>
              <div>Incidents: {h.incident_count}</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {allRoutes.filter(r => r.route_id !== (activeRouteId ?? safestRoute?.route_id))
        .map(route => route.segments.map((seg, i) => (
          <Polyline key={`${route.route_id}-${i}`}
            positions={[[seg.from_lat, seg.from_lng], [seg.to_lat, seg.to_lng]]}
            pathOptions={{ color: '#475569', weight: 3, opacity: 0.4, dashArray: '6 4' }}
            eventHandlers={{ click: () => onRouteSelect(route.route_id) }}
          />
        )))}

      {allRoutes.filter(r => r.route_id === (activeRouteId ?? safestRoute?.route_id))
        .map(route => route.segments.map((seg, i) => (
          <Polyline key={`active-${route.route_id}-${i}`}
            positions={[[seg.from_lat, seg.from_lng], [seg.to_lat, seg.to_lng]]}
            pathOptions={{ color: segmentColor(seg.risk_level), weight: 6, opacity: 0.92, lineCap: 'round' }}>
            <Popup>
              <div className="text-xs min-w-[160px]">
                <div className="font-semibold mb-1">{seg.road_name}</div>
                <div>{seg.risk_level} risk ({seg.risk_score.toFixed(3)})</div>
                {seg.warning && <div className="text-amber-600 mt-1">⚠ {seg.warning}</div>}
              </div>
            </Popup>
          </Polyline>
        )))}

      {safestRoute && safestRoute.segments.length > 0 && (() => {
        const first = safestRoute.segments[0]
        const last  = safestRoute.segments[safestRoute.segments.length - 1]
        return (<>
          <CircleMarker center={[first.from_lat, first.from_lng]} radius={10}
            pathOptions={{ color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 1, weight: 3 }}>
            <Popup><div className="text-xs font-semibold">📍 Origin</div></Popup>
          </CircleMarker>
          <CircleMarker center={[last.to_lat, last.to_lng]} radius={10}
            pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 1, weight: 3 }}>
            <Popup><div className="text-xs font-semibold">🏁 Destination</div></Popup>
          </CircleMarker>
        </>)
      })()}

      {safestRoute && <FitBounds route={safestRoute} />}
    </MapContainer>
  )
}
