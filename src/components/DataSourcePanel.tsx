'use client';

// components/DataSourcePanel.tsx - Left sidebar with data source toggles

import type { DataSource } from '../data/ontology';
import { SOURCE_COLORS } from '../data/theme';
import LiveCounter from './ui/LiveCounter';
import { getSourceStats } from '../engine/sources';

interface DataSourcePanelProps {
    sources: DataSource[];
    enabledSources: Set<string>;
    onToggle: (sourceId: string) => void;
}

export default function DataSourcePanel({
    sources,
    enabledSources,
    onToggle
}: DataSourcePanelProps) {
    const stats = getSourceStats(sources);

    return (
        <div className="w-[190px] h-full bg-bg-secondary border-r border-[var(--border)] flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)]">
                <h2 className="panel-header mb-1">DATA SOURCES</h2>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-accent">
                        {stats.activeSources}/{sources.length} ACTIVE
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-threat-low" />
                </div>
            </div>

            {/* Source list */}
            <div className="flex-1 overflow-y-auto p-2">
                {sources.map(source => {
                    const isEnabled = enabledSources.has(source.id);
                    const color = SOURCE_COLORS[source.id] || 'var(--accent)';

                    return (
                        <button
                            key={source.id}
                            onClick={() => onToggle(source.id)}
                            className={`w-full p-2 rounded mb-1 text-left transition-all ${isEnabled
                                    ? 'bg-[var(--accent-ghost)] border border-[var(--border-active)]'
                                    : 'bg-transparent border border-transparent opacity-40 hover:opacity-70'
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {/* Status dot */}
                                <div
                                    className={`w-2 h-2 rounded-full ${source.status === 'active' ? '' : 'opacity-50'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                                {/* Name */}
                                <span className="font-mono text-[10px] font-semibold tracking-[1px]" style={{ color }}>
                                    {source.name}
                                </span>
                                {/* Status badge */}
                                {source.status === 'degraded' && (
                                    <span className="font-mono text-[6px] px-1 py-0.5 bg-threat-high/20 text-threat-high rounded">
                                        DEGRADED
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Record count */}
                                <div className="flex flex-col">
                                    <LiveCounter
                                        value={source.records}
                                        rate={source.rate}
                                        format="compact"
                                        className="text-[11px] text-white"
                                    />
                                    <span className="data-label">RECORDS</span>
                                </div>

                                {/* Rate */}
                                <div className="flex flex-col items-end">
                                    <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                                        {source.rate.toFixed(1)}/s
                                    </span>
                                    <span className="data-label">RATE</span>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            <div className="mt-2">
                                <div className="flex justify-between mb-0.5">
                                    <span className="data-label">CONFIDENCE</span>
                                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                                        {Math.round(source.confidence * 100)}%
                                    </span>
                                </div>
                                <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${source.confidence * 100}%`,
                                            backgroundColor: color
                                        }}
                                    />
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer stats */}
            <div className="p-3 border-t border-[var(--border)]">
                <div className="flex justify-between items-center mb-2">
                    <span className="data-label">TOTAL EVENTS/SEC</span>
                    <span className="font-mono text-[11px] text-accent">
                        {stats.totalEventsPerSec.toFixed(1)}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="data-label">AVG CONFIDENCE</span>
                    <span className="font-mono text-[11px] text-accent">
                        {Math.round(stats.averageConfidence * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
