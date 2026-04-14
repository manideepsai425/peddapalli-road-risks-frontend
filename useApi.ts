import axios from 'axios'
import { useState, useCallback } from 'react'
import type {
  RiskRequest, RiskResponse,
  RouteRequest, RouteResponse,
  HotspotPoint, AnalyticsSummary,
} from '../types'

// Base URL — reads from Vite env or falls back to localhost for dev
const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL, timeout: 30_000 })

// ── Generic hook factory ──────────────────────────────────────────────────────
function useApiCall<TInput, TOutput>(
  caller: (input: TInput) => Promise<TOutput>
) {
  const [data,    setData]    = useState<TOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const call = useCallback(async (input: TInput) => {
    setLoading(true)
    setError(null)
    try {
      const result = await caller(input)
      setData(result)
      return result
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.detail ?? err.message
        : String(err)
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [caller])

  return { data, loading, error, call, setData }
}

// ── Concrete hooks ────────────────────────────────────────────────────────────

export function usePredictRisk() {
  return useApiCall<RiskRequest, RiskResponse>(async (req) => {
    const { data } = await api.post<RiskResponse>('/predict/risk', req)
    return data
  })
}

export function usePredictRoute() {
  return useApiCall<RouteRequest, RouteResponse>(async (req) => {
    const { data } = await api.post<RouteResponse>('/predict/route', req)
    return data
  })
}

export async function fetchHotspots(): Promise<HotspotPoint[]> {
  const { data } = await api.get<HotspotPoint[]>('/hotspots')
  return data
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/analytics')
  return data
}

export async function fetchHealth(): Promise<{ status: string; rows_loaded: number }> {
  const { data } = await api.get('/health')
  return data
}
