import React from 'react'
import { Navigation, Flame, BarChart2, Info } from 'lucide-react'
import type { TabId } from '../types'

interface Props {
  activeTab:    TabId
  onTabChange:  (tab: TabId) => void
  children:     React.ReactNode
  apiStatus:    'ok' | 'error' | 'unknown'
}

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'planner',   label: 'Route',     icon: <Navigation size={15} />, color: 'text-teal-400'   },
  { id: 'hotspots',  label: 'Hotspots',  icon: <Flame size={15} />,      color: 'text-orange-400' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={15} />,  color: 'text-blue-400'   },
  { id: 'about',     label: 'About',     icon: <Info size={15} />,       color: 'text-purple-400' },
]

export default function Sidebar({ activeTab, onTabChange, children, apiStatus }: Props) {
  return (
    <aside className="w-80 shrink-0 flex flex-col bg-night-900 border-r border-night-700/60 h-screen">
      {/* Header */}
      <div className="p-4 border-b border-night-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30
                          flex items-center justify-center text-base">
            🛣️
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white leading-tight">
              Road Risk AI
            </div>
            <div className="text-xs text-slate-500">Peddapalli, Telangana</div>
          </div>
        </div>

        {/* API status pill */}
        <div className={`mt-3 text-xs px-2.5 py-1 rounded-full inline-flex items-center gap-1.5
          ${apiStatus === 'ok'
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : apiStatus === 'error'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full inline-block
            ${apiStatus === 'ok' ? 'bg-green-400 animate-pulse' : apiStatus === 'error' ? 'bg-red-400' : 'bg-slate-400'}`}
          />
          {apiStatus === 'ok' ? 'API Connected' : apiStatus === 'error' ? 'API Offline' : 'Connecting…'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-night-700/60">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all
              text-xs font-medium border-b-2
              ${activeTab === tab.id
                ? `${tab.color} border-current bg-night-800/60`
                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-night-800/30'
              }`}
          >
            {tab.icon}
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden p-3">
        {children}
      </div>
    </aside>
  )
}
