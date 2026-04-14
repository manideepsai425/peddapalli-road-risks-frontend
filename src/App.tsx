import React, { useState, useEffect, useCallback } from 'react'
import Sidebar       from './components/Sidebar'
import MapView       from './components/MapView'
import MapControls   from './components/MapControls'
import RoutePlanner  from './components/RoutePlanner'
import HotspotsPanel from './components/HotspotsPanel'
import AnalyticsPanel from './components/AnalyticsPanel'
import AboutPanel    from './components/AboutPanel'
import { fetchHealth } from './hooks/useApi'
import type { TabId, RouteResponse, HotspotPoint } from './types'

export default function App() {
  const [activeTab,     setActiveTab]     = useState<TabId>('planner')
  const [apiStatus,     setApiStatus]     = useState<'ok' | 'error' | 'unknown'>('unknown')
  const [routeResult,   setRouteResult]   = useState<RouteResponse | null>(null)
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null)
  const [hotspots,      setHotspots]      = useState<HotspotPoint[]>([])
  const [showHeatmap,   setShowHeatmap]   = useState(true)
  const [showHotspots,  setShowHotspots]  = useState(true)

  // Check API health on mount
  useEffect(() => {
    fetchHealth()
      .then(() => setApiStatus('ok'))
      .catch(() => setApiStatus('error'))
  }, [])

  const handleRouteResult = useCallback((res: RouteResponse) => {
    setRouteResult(res)
    setActiveRouteId(res.safest_route.route_id)
  }, [])

  const handleHotspotsLoaded = useCallback((h: HotspotPoint[]) => {
    setHotspots(h)
  }, [])

  const allRoutes = routeResult
    ? [routeResult.safest_route, ...routeResult.alternatives]
    : []

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-night-950">

      {/* ── Sidebar ── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        apiStatus={apiStatus}
      >
        {activeTab === 'planner' && (
          <RoutePlanner
            onRouteResult={handleRouteResult}
            onRouteSelect={setActiveRouteId}
            activeRouteId={activeRouteId}
            routeResult={routeResult}
          />
        )}
        {activeTab === 'hotspots' && (
          <HotspotsPanel
            onHotspotsLoaded={handleHotspotsLoaded}
            showHeatmap={showHeatmap}
            onToggleHeatmap={() => setShowHeatmap(v => !v)}
            showHotspots={showHotspots}
            onToggleHotspots={() => setShowHotspots(v => !v)}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsPanel />}
        {activeTab === 'about'     && <AboutPanel />}
      </Sidebar>

      {/* ── Map ── */}
      <main className="flex-1 relative overflow-hidden">
        {/* Map fill */}
        <div className="absolute inset-0">
          <MapView
            safestRoute={routeResult?.safest_route ?? null}
            alternatives={allRoutes.filter(r =>
              r.route_id !== (activeRouteId ?? routeResult?.safest_route.route_id)
            )}
            hotspots={hotspots}
            showHeatmap={showHeatmap}
            showHotspots={showHotspots}
            activeRouteId={activeRouteId}
            onRouteSelect={setActiveRouteId}
          />
        </div>

        {/* Floating controls */}
        <MapControls
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap(v => !v)}
          showHotspots={showHotspots}
          onToggleHotspots={() => setShowHotspots(v => !v)}
        />

        {/* Bottom status bar */}
        {routeResult && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
                          glass-card px-4 py-2 flex items-center gap-4 text-xs animate-fade-in
                          border-teal-500/20">
            <span className="text-slate-400">
              Route: <span className="text-white font-medium">
                {routeResult.origin_label} → {routeResult.destination_label}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Safest risk: <span className="text-teal-400 font-mono font-semibold">
                {routeResult.safest_route.overall_risk.toFixed(3)}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              {routeResult.safest_route.estimated_km} km
            </span>
            {routeResult.alternatives.length > 0 && (
              <>
                <span className="text-slate-600">|</span>
                <div className="flex gap-1.5">
                  {[routeResult.safest_route, ...routeResult.alternatives].map(r => (
                    <button
                      key={r.route_id}
                      onClick={() => setActiveRouteId(r.route_id)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-all
                        ${r.route_id === activeRouteId
                          ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40'
                          : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                      {r.label} ({r.overall_risk.toFixed(2)})
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Welcome overlay when no route is selected */}
        {!routeResult && (
          <div className="absolute inset-0 flex items-center justify-center
                          pointer-events-none z-[999]">
            <div className="glass-card px-8 py-6 text-center max-w-sm
                            border-teal-500/20 glow-teal animate-fade-in">
              <div className="text-4xl mb-3">🛣️</div>
              <h1 className="font-display font-bold text-xl text-white mb-2">
                Peddapalli Road Risk AI
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enter an origin and destination in the sidebar to find the
                <span className="text-teal-400"> safest route</span> using
                AI-powered accident risk prediction.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-600">
                <span>🟢 Low risk</span>
                <span>🟡 Medium</span>
                <span>🟠 High</span>
                <span>🔴 Critical</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
