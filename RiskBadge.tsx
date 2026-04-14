import React from 'react'

interface Props {
  level: string
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

const LEVEL_CONFIG: Record<string, { cls: string; emoji: string }> = {
  Low:      { cls: 'risk-low',      emoji: '🟢' },
  Medium:   { cls: 'risk-medium',   emoji: '🟡' },
  High:     { cls: 'risk-high',     emoji: '🟠' },
  Critical: { cls: 'risk-critical', emoji: '🔴' },
}

export default function RiskBadge({ level, score, size = 'md' }: Props) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG['Medium']
  const sizeClass = size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : size === 'lg'
    ? 'text-sm px-3 py-1.5 font-semibold'
    : 'text-xs px-2.5 py-1'

  return (
    <span className={`${cfg.cls} ${sizeClass} rounded-full inline-flex items-center gap-1.5 font-medium`}>
      <span>{cfg.emoji}</span>
      <span>{level}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono">{score.toFixed(2)}</span>
      )}
    </span>
  )
}
