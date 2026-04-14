import React from 'react'
import { Info, Cpu, Map, GitBranch, Database, Shield } from 'lucide-react'

export default function AboutPanel() {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-1">
      <div className="glass-card p-4">
        <h2 className="font-display text-base font-semibold flex items-center gap-2 text-purple-400 mb-3">
          <Info size={16} /> About This Project
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          <span className="text-teal-400 font-semibold">Peddapalli Road Risk AI</span> is a
          mini-project for AI-based road accident prediction in Peddapalli district,
          Telangana, India. It combines machine learning with graph-based route optimisation
          to recommend the safest path between any two locations.
        </p>
        <div className="mt-3 text-xs text-slate-500 font-mono bg-night-900/60 rounded-lg p-2">
          Project: 35 — AI-Based Road Accident Prediction<br />
          Region: Peddapalli District, Telangana<br />
          Curriculum: JNTUH R22 | B.Tech AI &amp; ML
        </div>
      </div>

      <InfoCard
        icon={<Cpu size={14} className="text-blue-400" />}
        title="ML Model"
        color="blue"
        items={[
          'XGBoost Regressor — predicts risk_score (0–1) per road segment',
          'Trained on 500-row synthetic Peddapalli accident dataset',
          'Features: lat/lng, weather, time, traffic, road type, lanes, intersection, curve',
          'Encoders stored separately for reproducible inference',
        ]}
      />

      <InfoCard
        icon={<GitBranch size={14} className="text-teal-400" />}
        title="Safest Route Algorithm"
        color="teal"
        items={[
          '18-node road graph covering major Peddapalli junctions',
          'Dijkstra with 3 different cost functions: safest, fastest, balanced',
          'Per-segment ML risk prediction using current weather + time',
          'Routes ranked by: high-risk segment count → average risk score',
          'High-risk zones (risk > 0.70) are penalised heavily in cost function',
        ]}
      />

      <InfoCard
        icon={<Map size={14} className="text-green-400" />}
        title="Map Features"
        color="green"
        items={[
          'Route colour-coding: 🟢 Green = safe, 🟡 Amber = medium, 🔴 Red = high-risk',
          'Leaflet.heat heatmap overlay for accident density',
          'Clickable hotspot markers with incident counts',
          'Auto-fit bounds on route display',
        ]}
      />

      <InfoCard
        icon={<Database size={14} className="text-amber-400" />}
        title="Data"
        color="amber"
        items={[
          '500-row synthetic dataset: accidents_data.csv',
          'Coordinates: lat 18.50–18.80, lng 79.20–79.60 (Peddapalli district)',
          '15 road segments including SH-1, Ramagundam Road, Basanthnagar Road',
          'Realistic risk weighting: night + rain + highway = higher risk',
        ]}
      />

      <InfoCard
        icon={<Shield size={14} className="text-purple-400" />}
        title="Stack"
        color="purple"
        items={[
          'Backend: FastAPI + XGBoost + Pandas — deployed on Render',
          'Frontend: React + Vite + TypeScript + Tailwind + React-Leaflet — on Vercel',
          'Charts: Recharts | Icons: Lucide React',
          'Fonts: Syne (display) + DM Sans (body) + JetBrains Mono (code)',
        ]}
      />
    </div>
  )
}

function InfoCard({ icon, title, color, items }: {
  icon: React.ReactNode; title: string; color: string; items: string[]
}) {
  const border: Record<string, string> = {
    blue:   'border-blue-500/20',
    teal:   'border-teal-500/20',
    green:  'border-green-500/20',
    amber:  'border-amber-500/20',
    purple: 'border-purple-500/20',
  }
  return (
    <div className={`glass-card p-4 border ${border[color]}`}>
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-2.5 font-display">
        {icon} {title}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
            <span className="mt-0.5 text-slate-600">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
