'use client';

// components/AlertHistory.tsx - Panel showing dismissed and responded alerts

import type { TimelineEvent } from '../data/ontology';
import { THREAT_COLORS } from '../data/theme';

interface AlertHistoryProps {
    events: TimelineEvent[];
    dismissedAlertIds: Set<number>;
    onClose: () => void;
    onReview: (event: TimelineEvent) => void;
}

export default function AlertHistory({ events, dismissedAlertIds, onClose, onReview }: AlertHistoryProps) {
    // Get all interactive events that were dismissed or responded to
    const dismissedEvents = events.filter(e =>
        e.requiresResponse && (dismissedAlertIds.has(e.id) || e.playerResponse)
    );

    // Sort by time (most recent first)
    const sortedEvents = [...dismissedEvents].sort((a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 pointer-events-none">
            <div className="bg-bg-secondary border border-[var(--border)] rounded-lg shadow-2xl w-[400px] h-[600px] flex flex-col pointer-events-auto animate-fade-in">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div>
                        <h3 className="font-mono text-[11px] font-semibold text-white tracking-[1px]">
                            ALERT HISTORY
                        </h3>
                        <p className="font-mono text-[8px] text-[var(--text-secondary)] mt-1">
                            {sortedEvents.length} dismissed or responded alerts
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-[var(--border)] flex items-center justify-center">
                                <span className="text-xl text-[var(--text-tertiary)]">📋</span>
                            </div>
                            <p className="font-mono text-[9px] tracking-[1px] text-[var(--text-secondary)]">
                                NO ALERT HISTORY YET
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sortedEvents.map(event => {
                                const isDismissed = dismissedAlertIds.has(event.id);
                                const response = event.playerResponse
                                    ? event.responseOptions?.find(o => o.id === event.playerResponse)
                                    : null;

                                return (
                                    <div
                                        key={event.id}
                                        className="p-3 rounded border border-[var(--border)] bg-[var(--bg-card)] hover:border-accent/30 transition-colors"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: THREAT_COLORS[event.severity] }}
                                                />
                                                <span
                                                    className="font-mono text-[7px] tracking-[1px] px-1.5 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: `${THREAT_COLORS[event.severity]}20`,
                                                        color: THREAT_COLORS[event.severity],
                                                    }}
                                                >
                                                    {event.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[7px] text-[var(--text-secondary)]">
                                                {new Date(event.time).toLocaleTimeString()}
                                            </span>
                                        </div>

                                        {/* Message */}
                                        <p className="font-body text-[10px] text-white mb-2 leading-relaxed">
                                            {event.label}
                                        </p>

                                        {/* Status */}
                                        <div className="flex items-center justify-between">
                                            {isDismissed ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                                                        ⚠️ DISMISSED
                                                    </span>
                                                </div>
                                            ) : response ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono text-[7px] text-[var(--text-secondary)]">
                                                        RESPONDED:
                                                    </span>
                                                    <span className="font-mono text-[8px] text-accent">
                                                        ✓ {response.label}
                                                    </span>
                                                </div>
                                            ) : null}

                                            {/* Review button for dismissed alerts */}
                                            {isDismissed && (
                                                <button
                                                    onClick={() => onReview(event)}
                                                    className="font-mono text-[7px] tracking-[1px] text-accent hover:text-white transition-colors px-2 py-1 rounded border border-accent/30 hover:bg-accent/10"
                                                >
                                                    REVIEW
                                                </button>
                                            )}
                                        </div>

                                        {/* Source */}
                                        <div className="mt-2 pt-2 border-t border-[var(--border)]">
                                            <span className="font-mono text-[7px] text-[var(--text-tertiary)]">
                                                SOURCE: {event.source}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="font-mono text-[7px] tracking-[1px] text-[var(--text-secondary)]">
                        INTELLIGENCE ARCHIVE
                    </span>
                    <button
                        onClick={onClose}
                        className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        CLOSE [ESC]
                    </button>
                </div>
            </div>
        </div>
    );
}
