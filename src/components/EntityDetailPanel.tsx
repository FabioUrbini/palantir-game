'use client';

// components/EntityDetailPanel.tsx - Right sidebar for selected entity details

import type { Entity, Connection, TimelineEvent, PlayerResources } from '../data/ontology';
import { ENTITY_ICONS, THREAT_COLORS, SOURCE_COLORS, ENTITY_COLORS } from '../data/theme';
import ProgressRing from './ui/ProgressRing';
import MiniSparkline from './ui/MiniSparkline';
import EntityActions from './EntityActions';
import { mulberry32 } from '../engine/seed';

interface EntityDetailPanelProps {
    entity: Entity | null;
    connections: Connection[];
    events: TimelineEvent[];
    allEntities: Entity[];
    resources: PlayerResources;
    onClose: () => void;
    onAction: (entityId: number, action: string) => void;
}

export default function EntityDetailPanel({
    entity,
    connections,
    events,
    allEntities,
    resources,
    onClose,
    onAction
}: EntityDetailPanelProps) {
    if (!entity) {
        return (
            <div className="w-[260px] h-full bg-bg-secondary border-l border-[var(--border)] flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                        <span className="text-2xl text-[var(--text-tertiary)]">?</span>
                    </div>
                    <p className="font-mono text-[9px] tracking-[1px] text-[var(--text-secondary)]">
                        SELECT AN ENTITY<br />TO VIEW DETAILS
                    </p>
                </div>
            </div>
        );
    }

    const entityConnections = connections.filter(
        c => c.from === entity.id || c.to === entity.id
    );

    const entityEvents = events.filter(e => e.entity === entity.id).slice(-10);

    // Generate fake activity data for sparkline
    const rng = mulberry32(entity.id * 1234);
    const activityData = Array.from({ length: 30 }, () => Math.floor(rng() * 100));

    const color = ENTITY_COLORS[entity.type] || 'var(--accent)';

    return (
        <div className="w-[260px] h-full bg-bg-secondary border-l border-[var(--border)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
                >
                    ×
                </button>

                <div className="flex items-start gap-3">
                    {/* Entity icon */}
                    <div
                        className="w-10 h-10 rounded flex items-center justify-center text-xl"
                        style={{
                            backgroundColor: `${color}20`,
                            color: color,
                        }}
                    >
                        {ENTITY_ICONS[entity.type] || '◆'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-[12px] font-semibold text-white truncate">
                            {entity.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span
                                className="font-mono text-[7px] tracking-[1px] px-1.5 py-0.5 rounded"
                                style={{
                                    backgroundColor: `${color}20`,
                                    color: color,
                                }}
                            >
                                {entity.type.toUpperCase()}
                            </span>
                            <span
                                className="font-mono text-[7px] tracking-[1px] px-1.5 py-0.5 rounded"
                                style={{
                                    backgroundColor: `${THREAT_COLORS[entity.threat]}20`,
                                    color: THREAT_COLORS[entity.threat],
                                }}
                            >
                                {entity.threat.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entity Actions */}
            <EntityActions
                entity={entity}
                resources={resources}
                onAction={onAction}
            />

            {/* Risk score */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                    <span className="data-label">RISK SCORE</span>
                    <div className="font-mono text-2xl font-bold" style={{ color: THREAT_COLORS[entity.threat] }}>
                        {entity.risk}
                    </div>
                </div>
                <ProgressRing
                    value={entity.risk}
                    size={52}
                    color={THREAT_COLORS[entity.threat]}
                    showValue={false}
                />
            </div>

            {/* Location */}
            <div className="p-4 border-b border-[var(--border)]">
                <span className="data-label">LOCATION</span>
                <div className="font-mono text-[11px] text-white mt-1">{entity.city}</div>
                {entity.lat && entity.lng && (
                    <div className="font-mono text-[9px] text-[var(--text-secondary)] mt-0.5">
                        {entity.lat.toFixed(4)}°N, {entity.lng.toFixed(4)}°E
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="p-4 border-b border-[var(--border)]">
                <span className="data-label">ASSESSMENT</span>
                <p className="font-body text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {entity.desc}
                </p>
            </div>

            {/* Activity sparkline */}
            <div className="p-4 border-b border-[var(--border)]">
                <span className="data-label mb-2 block">30-DAY ACTIVITY</span>
                <MiniSparkline
                    data={activityData}
                    width={220}
                    height={40}
                    color={color}
                />
            </div>

            {/* Sources */}
            <div className="p-4 border-b border-[var(--border)]">
                <span className="data-label mb-2 block">INTELLIGENCE SOURCES</span>
                <div className="flex flex-wrap gap-1.5">
                    {entity.sources.map(sourceId => (
                        <span
                            key={sourceId}
                            className="font-mono text-[8px] tracking-[1px] px-2 py-1 rounded"
                            style={{
                                backgroundColor: `${SOURCE_COLORS[sourceId] || 'var(--accent)'}20`,
                                color: SOURCE_COLORS[sourceId] || 'var(--accent)',
                            }}
                        >
                            {sourceId}
                        </span>
                    ))}
                </div>
            </div>

            {/* Connections */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <span className="data-label mb-2 block">
                        CONNECTIONS ({entityConnections.length})
                    </span>
                    <div className="space-y-2">
                        {entityConnections.slice(0, 8).map((conn, idx) => {
                            const otherId = conn.from === entity.id ? conn.to : conn.from;
                            const other = allEntities.find(e => e.id === otherId);
                            if (!other) return null;

                            const otherColor = ENTITY_COLORS[other.type] || 'var(--accent)';

                            return (
                                <div
                                    key={idx}
                                    className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border)]"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span style={{ color: otherColor }}>{ENTITY_ICONS[other.type]}</span>
                                        <span className="font-mono text-[9px] text-white truncate">{other.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[7px] text-[var(--text-secondary)]">
                                            {conn.type}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1 bg-[var(--border)] rounded-full">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${conn.strength * 100}%`,
                                                        backgroundColor: 'var(--accent)',
                                                    }}
                                                />
                                            </div>
                                            <span className="font-mono text-[7px] text-[var(--text-secondary)]">
                                                {conn.evidence} pts
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent events */}
                {entityEvents.length > 0 && (
                    <div className="p-4 pt-0">
                        <span className="data-label mb-2 block">RECENT EVENTS</span>
                        <div className="space-y-1">
                            {entityEvents.slice(-5).reverse().map(event => (
                                <div
                                    key={event.id}
                                    className="p-2 rounded bg-[var(--bg-card)] border border-[var(--border)]"
                                >
                                    <div className="font-mono text-[8px] text-[var(--text-secondary)] mb-1">
                                        {new Date(event.time).toLocaleString()}
                                    </div>
                                    <div
                                        className="font-body text-[9px]"
                                        style={{ color: THREAT_COLORS[event.severity] }}
                                    >
                                        {event.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
