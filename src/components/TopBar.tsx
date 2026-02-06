'use client';

// components/TopBar.tsx - Logo, nav tabs, clock, status

import { useEffect, useState } from 'react';
import type { Phase, PlayerResources } from '../data/ontology';
import ResourceBar from './ResourceBar';

interface TopBarProps {
    phase: Phase;
    activeView: 'graph' | 'map' | 'analytics' | 'timeline' | 'query';
    onViewChange: (view: 'graph' | 'map' | 'analytics' | 'timeline' | 'query') => void;
    timeSpeed: number;
    onTimeSpeedChange: (speed: number) => void;
    resources: PlayerResources;
}

const VIEWS = [
    { id: 'graph' as const, label: 'GRAPH' },
    { id: 'map' as const, label: 'MAP' },
    { id: 'analytics' as const, label: 'ANALYTICS' },
    { id: 'timeline' as const, label: 'TIMELINE' },
    { id: 'query' as const, label: 'QUERY' },
];

export default function TopBar({ phase, activeView, onViewChange, timeSpeed, onTimeSpeedChange, resources }: TopBarProps) {
    const [time, setTime] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set mounted flag and initial time on client
        setMounted(true);
        setTime(new Date());

        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-12 bg-bg-secondary border-b border-[var(--border)] flex items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border-2 border-accent rotate-45 flex items-center justify-center">
                        <div className="w-2 h-2 bg-accent rotate-[-45deg]" />
                    </div>
                    <div className="font-mono font-bold text-[13px] tracking-[4px] text-white">
                        PALANTIR
                    </div>
                    <div className="font-mono text-[9px] tracking-[2px] text-[var(--text-secondary)]">
                        GOTHAM
                    </div>
                </div>

                {/* Phase indicator */}
                <div className="flex items-center gap-2 ml-4">
                    <div
                        className={`w-2 h-2 rounded-full animate-pulse-custom ${phase.alertLevel === 'MAXIMUM' ? 'bg-threat-critical' :
                            phase.alertLevel === 'CRITICAL' ? 'bg-threat-critical' :
                                phase.alertLevel === 'HIGH' ? 'bg-threat-high' :
                                    'bg-threat-medium'
                            }`}
                    />
                    <span className="font-mono text-[9px] tracking-[2px] text-[var(--text-secondary)]">
                        OP: NIGHTFALL — {phase.name}
                    </span>
                </div>
            </div>

            {/* Navigation tabs */}
            <nav className="flex items-center gap-1">
                {VIEWS.map(view => (
                    <button
                        key={view.id}
                        onClick={() => onViewChange(view.id)}
                        className={`px-4 py-2 font-mono text-[9px] tracking-[2px] transition-all ${activeView === view.id
                            ? 'text-accent bg-[var(--accent-ghost)] border-b-2 border-accent'
                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-ghost)]'
                            }`}
                    >
                        {view.label}
                    </button>
                ))}
            </nav>

            {/* Status area */}
            <div className="flex items-center gap-6">
                {/* Alert level */}
                <div className="flex items-center gap-2">
                    <span
                        className={`font-mono text-[9px] tracking-[1px] px-2 py-0.5 rounded ${phase.alertLevel === 'MAXIMUM' ? 'bg-threat-critical text-white' :
                            phase.alertLevel === 'CRITICAL' ? 'bg-threat-critical/20 text-threat-critical' :
                                phase.alertLevel === 'HIGH' ? 'bg-threat-high/20 text-threat-high' :
                                    'bg-threat-medium/20 text-threat-medium'
                            }`}
                    >
                        ALERT: {phase.alertLevel}
                    </span>
                </div>

                {/* Time Speed Selector */}
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-[var(--border)] bg-[var(--bg-card)]">
                    <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                        SPEED:
                    </span>
                    <select
                        value={timeSpeed}
                        onChange={(e) => onTimeSpeedChange(Number(e.target.value))}
                        className="bg-transparent font-mono text-[9px] text-accent outline-none cursor-pointer"
                    >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={5}>5x</option>
                        <option value={10}>10x</option>
                        <option value={20}>20x</option>
                        <option value={50}>50x</option>
                    </select>
                </div>

                {/* System Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#30d158] animate-pulse-custom" />
                        <span className="font-mono text-[8px] tracking-[1px] text-[#30d158]">
                            SYSTEMS NOMINAL
                        </span>
                    </div>
                </div>

                {/* Resource Bar */}
                <ResourceBar resources={resources} />

                {/* Clock */}
                <div className="font-mono text-[11px] text-accent tabular-nums">
                    {mounted && time ? time.toISOString().replace('T', ' ').substring(0, 19) : '----------- --:--:--'} UTC
                </div>

                {/* Analyst badge */}
                <div className="flex items-center gap-2 pl-4 border-l border-[var(--border)]">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px] font-mono font-bold">
                        A1
                    </div>
                    <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                        ANALYST
                    </span>
                </div>
            </div>
        </div>
    );
}
