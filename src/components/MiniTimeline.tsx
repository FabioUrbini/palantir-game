'use client';

// components/MiniTimeline.tsx - Bottom overlay showing recent events

import type { TimelineEvent, Entity } from '../data/ontology';
import { THREAT_COLORS, ENTITY_ICONS, ENTITY_COLORS, SOURCE_COLORS } from '../data/theme';

interface MiniTimelineProps {
    events: TimelineEvent[];
    entities: Entity[];
    selectedEntityId: number | null;
    onEntitySelect: (id: number) => void;
}

export default function MiniTimeline({
    events,
    entities,
    selectedEntityId,
    onEntitySelect
}: MiniTimelineProps) {
    const recentEvents = events.slice(-8).reverse();

    const getEntity = (id: number) => entities.find(e => e.id === id);

    return (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent pointer-events-none">
            <div className="absolute bottom-0 left-0 right-0 h-20 px-4 py-2 pointer-events-auto">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-custom" />
                    <span className="panel-header">LATEST INTELLIGENCE</span>
                </div>

                {/* Event strip */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {recentEvents.map(event => {
                        const entity = getEntity(event.entity);
                        if (!entity) return null;

                        const isSelected = selectedEntityId === entity.id;
                        const entityColor = ENTITY_COLORS[entity.type] || 'var(--accent)';

                        return (
                            <button
                                key={event.id}
                                onClick={() => onEntitySelect(entity.id)}
                                className={`flex-shrink-0 p-2 rounded border transition-all ${isSelected
                                        ? 'border-accent bg-accent/10'
                                        : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-active)]'
                                    }`}
                                style={{ minWidth: '180px', maxWidth: '220px' }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Time */}
                                    <span className="font-mono text-[7px] text-[var(--text-tertiary)]">
                                        {new Date(event.time).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    {/* Severity */}
                                    <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: THREAT_COLORS[event.severity] }}
                                    />
                                    {/* Source */}
                                    <span
                                        className="font-mono text-[6px] tracking-[0.5px]"
                                        style={{ color: SOURCE_COLORS[event.source] || 'var(--accent)' }}
                                    >
                                        {event.source}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <span style={{ color: entityColor, fontSize: '10px' }}>
                                        {ENTITY_ICONS[entity.type]}
                                    </span>
                                    <span className="font-mono text-[8px] text-white truncate">
                                        {entity.name}
                                    </span>
                                </div>
                                <p className="font-body text-[8px] text-[var(--text-secondary)] line-clamp-2">
                                    {event.label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
