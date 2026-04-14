// ─── API Types ────────────────────────────────────────────────────────────────

export interface RiskRequest {
  latitude: number
  longitude: number
  weather_condition: string
  time_of_day: string
  traffic_density: string
  road_type: string
  num_lanes: number
  has_intersection: boolean
  has_curve: boolean
  is_peak_hour: boolean
}

export interface RiskResponse {
  risk_score: number
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical'
  confidence: number
  explanation: string
}

export interface RouteRequest {
  origin_lat: number
  origin_lng: number
  dest_lat: number
  dest_lng: number
  preferred_time: string
  weather: string
  traffic_density: string
}

export interface RouteSegment {
  from_lat: number
  from_lng: number
  to_lat: number
  to_lng: number
  road_name: string
  risk_score: number
  risk_level: string
  warning: string | null
}

export interface RouteAlternative {
  route_id: string
  label: string
  segments: RouteSegment[]
  overall_risk: number
  estimated_km: number
  high_risk_count: number
  risk_breakdown: string
  is_recommended: boolean
}

export interface RouteResponse {
  safest_route: RouteAlternative
  alternatives: RouteAlternative[]
  origin_label: string
  destination_label: string
  analysis_summary: string
}

export interface HotspotPoint {
  latitude: number
  longitude: number
  risk_score: number
  road_name: string
  incident_count: number
}

export interface AnalyticsSummary {
  total_accidents: number
  high_risk_segments: number
  most_dangerous_road: string
  peak_accident_time: string
  peak_weather: string
  avg_risk_score: number
  by_severity: Record<string, number>
  by_time_of_day: Record<string, number>
  by_weather: Record<string, number>
  by_road_type: Record<string, number>
  monthly_trend: Array<{ month: string; count: number; avg_risk: number }>
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export type TabId = 'planner' | 'hotspots' | 'analytics' | 'about'

export interface NamedLocation {
  label: string
  lat: number
  lng: number
}

export const NAMED_LOCATIONS: NamedLocation[] = [
  { label: 'Peddapalli Town',          lat: 18.6160, lng: 79.3830 },
  { label: 'Basanthnagar',             lat: 18.7450, lng: 79.4950 },
  { label: 'Godavarikhani',            lat: 18.6600, lng: 79.4900 },
  { label: 'Ramagundam',               lat: 18.7950, lng: 79.4480 },
  { label: 'Manthani',                 lat: 18.5800, lng: 79.5000 },
  { label: 'Karimnagar Side',          lat: 18.5500, lng: 79.3400 },
  { label: 'Dharmaram',                lat: 18.6350, lng: 79.3200 },
  { label: 'Sulthanabad',              lat: 18.5650, lng: 79.4400 },
  { label: 'Mancherial Junction',      lat: 18.7500, lng: 79.5100 },
  { label: 'Odela',                    lat: 18.6400, lng: 79.3050 },
  { label: 'Industrial Area (RMG)',    lat: 18.7800, lng: 79.4650 },
  { label: 'Bypass Junction',          lat: 18.6050, lng: 79.3970 },
]

export const WEATHER_OPTIONS = ['Clear', 'Rain', 'Fog', 'Heavy Rain']
export const TIME_OPTIONS    = ['Morning', 'Afternoon', 'Evening', 'Night']
export const TRAFFIC_OPTIONS = ['Low', 'Medium', 'High']
