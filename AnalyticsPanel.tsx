import React, { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BarChart2, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react'
import { fetchAnalytics } from '../hooks/useApi'
import type { AnalyticsSummary } from '../types'

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']

const TOOLTIP_STYLE = {
  backgroundColor: '#131b2e',
  border: '1px solid #1c2942',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: 12,
  fontFamily: 'DM Sans, sans-serif',
}

export default function AnalyticsPanel() {
  const [data,    setData]    = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const load = async () => {
    setLoading(true); setError(null)
    try { setData(await fetchAnalytics()) }
    catch (e: unknown) { setError(String(e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading && !data) return (
    <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
      <RefreshCw size={16} className="animate-spin mr-2 text-teal-400" /> Loading analytics…
    </div>
  )

  if (error) return (
    <div className="glass-card p-4 text-red-400 text-sm flex items-center gap-2">
      <AlertTriangle size={14} /> {error}
    </div>
  )

  if (!data) return null

  const severityData = Object.entries(data.by_severity).map(([name, value]) => ({ name, value }))
  const timeData     = Object.entries(data.by_time_of_day).map(([name, value]) => ({ name, value }))
  const weatherData  = Object.entries(data.by_weather).map(([name, value]) => ({ name, value }))
  const roadData     = Object.entries(data.by_road_type).map(([name, value]) => ({ name, value }))

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">

      {/* Header */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold flex items-center gap-2 text-blue-400">
            <BarChart2 size={16} /> Analytics Dashboard
          </h2>
          <button onClick={load} disabled={loading}
            className="p-1.5 rounded-lg bg-night-700 hover:bg-night-600 transition-colors">
            <RefreshCw size={13} className={loading ? 'animate-spin text-teal-400' : 'text-slate-400'} />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2">
        <KPICard label="Total Accidents"  value={data.total_accidents.toLocaleString()} color="blue"   />
        <KPICard label="High-Risk Spots"  value={data.high_risk_segments.toString()}    color="red"    />
        <KPICard label="Avg Risk Score"   value={data.avg_risk_score.toFixed(3)}        color="amber"  />
        <KPICard label="Peak Time"        value={data.peak_accident_time}               color="purple" />
      </div>

      {/* Dangerous road */}
      <div className="glass-card p-3">
        <div className="text-xs text-slate-400 mb-1">⚠ Most Dangerous Road</div>
        <div className="font-display font-semibold text-red-400 text-sm leading-snug">
          {data.most_dangerous_road}
        </div>
      </div>

      {/* Monthly trend */}
      <ChartCard title="Monthly Accident Trend" icon={<TrendingUp size={14} />}>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data.monthly_trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }}
                   tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2}
                  dot={{ r: 2, fill: '#3b82f6' }} name="Accidents" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* By time of day */}
      <ChartCard title="Accidents by Time of Day">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={timeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Accidents" radius={[3, 3, 0, 0]}>
              {timeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* By weather */}
      <ChartCard title="Accidents by Weather">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weatherData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Accidents" radius={[3, 3, 0, 0]}>
              {weatherData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Severity pie */}
      <ChartCard title="Severity Distribution">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={severityData} cx="50%" cy="50%" outerRadius={58}
                 dataKey="value" nameKey="name" label={({ name, percent }) =>
                   `${name} ${(percent * 100).toFixed(0)}%`}
                 labelLine={false}
                 fontSize={10}>
              {severityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* By road type */}
      <ChartCard title="Accidents by Road Type">
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={roadData} layout="vertical"
                    margin={{ top: 0, right: 8, left: 12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2942" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={60} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Accidents" radius={[0, 3, 3, 0]}>
              {roadData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  )
}

function KPICard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue:   'text-blue-400 border-blue-500/20',
    red:    'text-red-400 border-red-500/20',
    amber:  'text-amber-400 border-amber-500/20',
    purple: 'text-purple-400 border-purple-500/20',
  }
  return (
    <div className={`glass-card p-3 border ${colorMap[color]}`}>
      <div className={`font-display font-bold text-xl ${colorMap[color].split(' ')[0]}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}

function ChartCard({ title, icon, children }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="glass-card p-3">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider
                      flex items-center gap-1.5 mb-3">
        {icon} {title}
      </div>
      {children}
    </div>
  )
}
