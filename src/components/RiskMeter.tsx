import React from 'react'

interface Props {
  score: number   // 0–1
  size?: number
}

export default function RiskMeter({ score, size = 120 }: Props) {
  const r      = 44
  const cx     = 60
  const cy     = 60
  const circumference = Math.PI * r   // half-circle arc length
  const offset = circumference * (1 - Math.min(1, score))

  const color =
    score < 0.35 ? '#22c55e'
    : score < 0.55 ? '#f59e0b'
    : score < 0.75 ? '#f97316'
    : '#ef4444'

  const label =
    score < 0.35 ? 'LOW'
    : score < 0.55 ? 'MEDIUM'
    : score < 0.75 ? 'HIGH'
    : 'CRITICAL'

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <svg viewBox="0 0 120 70" width={size} height={size * 0.6}>
        {/* Track */}
        <path
          d={`M 16 60 A ${r} ${r} 0 0 1 104 60`}
          fill="none"
          stroke="#1c2942"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M 16 60 A ${r} ${r} 0 0 1 104 60`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
        {/* Score text */}
        <text x={cx} y={56} textAnchor="middle" fontSize="16" fontWeight="700"
              fill={color} fontFamily="JetBrains Mono, monospace">
          {(score * 100).toFixed(0)}
        </text>
      </svg>
      <div className="text-xs font-mono font-semibold tracking-widest" style={{ color }}>
        {label}
      </div>
    </div>
  )
}
