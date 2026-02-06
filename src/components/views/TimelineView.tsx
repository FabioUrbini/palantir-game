'use client';

// components/views/TimelineView.tsx - Full chronological event feed

import type { TimelineEvent, Entity } from '../../data/ontology';
import { THREAT_COLORS, ENTITY_ICONS, ENTITY_COLORS, SOURCE_COLORS } from '../../data/theme';

interface TimelineViewProps {
    events: TimelineEvent[];
    entities: Entity[];
    selectedEntityId: number | null;
    onEntitySelect: (id: number) => void;
}

export default function TimelineView({
    events,
    entities,
    selectedEntityId,
    onEntitySelect,
}: TimelineViewProps) {
    const getEntity = (id: number) => entities.find(e => e.id === id);

    // Group events by date
    const groupedEvents: Record<string, TimelineEvent[]> = {};
    events.forEach(event => {
        const date = new Date(event.time).toLocaleDateString();
        if (!groupedEvents[date]) groupedEvents[date] = [];
        groupedEvents[date].push(event);
    });

    const sortedDates = Object.keys(groupedEvents).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-mono text-lg text-white">Intelligence Timeline</h2>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)]">
                        {events.length} events recorded
                    </p>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                    {['critical', 'high', 'medium', 'low'].map(level => {
                        const count = events.filter(e => e.severity === level).length;
                        return (
                            <div key={level} className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: THREAT_COLORS[level] }}
                                />
                                <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[100px] top-0 bottom-0 w-px bg-[var(--border)]" />

                {sortedDates.map(date => (
                    <div key={date} className="mb-6">
                        {/* Date header */}
                        <div className="flex items-center mb-3">
                            <div className="w-[100px] pr-4 text-right">
                                <span className="font-mono text-[10px] text-accent">
                                    {date}
                                </span>
                            </div>
                            <div className="w-3 h-3 rounded-full bg-accent border-2 border-bg-primary z-10 relative" />
                            <div className="flex-1 h-px bg-accent/30 ml-2" />
                        </div>

                        {/* Events for this date */}
                        <div className="space-y-2">
                            {groupedEvents[date]
                                .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                                .map((event, idx) => {
                                    const entity = getEntity(event.entity);
                                    if (!entity) return null;

                                    const isSelected = selectedEntityId === entity.id;
                                    const isRelated = selectedEntityId !== null;
                                    const isDimmed = isRelated && !isSelected;
                                    const entityColor = ENTITY_COLORS[entity.type] || 'var(--accent)';

                                    return (
                                        <div
                                            key={event.id}
                                            className={`flex items-start transition-opacity ${isDimmed ? 'opacity-30' : 'opacity-100'
                                                }`}
                                        >
                                            {/* Time */}
                                            <div className="w-[100px] pr-4 text-right flex-shrink-0">
                                                <span className="font-mono text-[9px] text-[var(--text-secondary)]">
                                                    {new Date(event.time).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>

                                            {/* Dot */}
                                            <div className="relative flex-shrink-0 w-3 flex justify-center">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: THREAT_COLORS[event.severity] }}
                                                />
                                            </div>

                                            {/* Event card */}
                                            <button
                                                onClick={() => onEntitySelect(entity.id)}
                                                className={`flex-1 ml-4 p-3 rounded border transition-all text-left ${isSelected
                                                        ? 'border-accent bg-accent/10'
                                                        : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-active)]'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span style={{ color: entityColor }}>
                                                            {ENTITY_ICONS[entity.type]}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-white">
                                                            {entity.name}
                                                        </span>
                                                        <span
                                                            className="font-mono text-[7px] px-1.5 py-0.5 rounded"
                                                            style={{
                                                                backgroundColor: `${SOURCE_COLORS[event.source]}20`,
                                                                color: SOURCE_COLORS[event.source],
                                                            }}
                                                        >
                                                            {event.source}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="font-mono text-[7px] px-1.5 py-0.5 rounded"
                                                        style={{
                                                            backgroundColor: `${THREAT_COLORS[event.severity]}20`,
                                                            color: THREAT_COLORS[event.severity],
                                                        }}
                                                    >
                                                        {event.severity.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="font-body text-[10px] text-[var(--text-secondary)] leading-relaxed">
                                                    {event.label}
                                                </p>
                                                <div className="mt-2 font-mono text-[7px] text-[var(--text-tertiary)]">
                                                    EVENT #{event.id}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-12">
                        <div className="font-mono text-2xl text-[var(--text-tertiary)] mb-2">∅</div>
                        <p className="font-mono text-[10px] text-[var(--text-secondary)]">
                            No events recorded yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
