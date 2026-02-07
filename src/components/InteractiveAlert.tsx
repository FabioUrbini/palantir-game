'use client';

// components/InteractiveAlert.tsx - Modal for responding to alerts

import type { TimelineEvent, PlayerResources, ResponseOption } from '../data/ontology';
import { THREAT_COLORS } from '../data/theme';
import { useState, useEffect } from 'react';

interface InteractiveAlertProps {
    event: TimelineEvent;
    resources: PlayerResources;
    onRespond: (eventId: number, optionId: string) => void;
    onDismiss: () => void;
}

export default function InteractiveAlert({ event, resources, onRespond, onDismiss }: InteractiveAlertProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!event.responseDeadline) return;

        const calculateTimeLeft = () => {
            const deadline = new Date(event.responseDeadline!).getTime();
            const now = Date.now();
            return Math.max(0, Math.floor((deadline - now) / 1000));
        };

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
        }, 1000);

        return () => clearInterval(interval);
    }, [event.responseDeadline, onDismiss]);

    const canAfford = (cost: ResponseOption['cost']) => {
        if (cost.budget && resources.budget < cost.budget) return false;
        if (cost.agents && resources.agents < cost.agents) return false;
        if (cost.dataCredits && resources.dataCredits < cost.dataCredits) return false;
        return true;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-bg-secondary border-2 border-[var(--border)] rounded-lg shadow-2xl max-w-lg w-full mx-4 animate-scale-in">
                {/* Header */}
                <div
                    className="p-4 border-b-2 border-[var(--border)] flex items-center justify-between"
                    style={{ backgroundColor: `${THREAT_COLORS[event.severity]}10` }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full animate-pulse-custom"
                            style={{ backgroundColor: THREAT_COLORS[event.severity] }}
                        />
                        <div>
                            <div className="font-mono text-[8px] tracking-[2px] text-[var(--text-secondary)]">
                                {event.severity.toUpperCase()} ALERT
                            </div>
                            <div className="font-mono text-[11px] font-semibold text-white">
                                REQUIRES IMMEDIATE RESPONSE
                            </div>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="text-right">
                        <div className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                            TIME REMAINING
                        </div>
                        <div
                            className="font-mono text-[16px] font-bold tabular-nums"
                            style={{ color: timeLeft < 30 ? THREAT_COLORS.critical : THREAT_COLORS.medium }}
                        >
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Message */}
                    <div className="mb-5">
                        <div className="font-mono text-[9px] tracking-[1px] text-[var(--text-secondary)] mb-2">
                            INTELLIGENCE SUMMARY
                        </div>
                        <p className="font-body text-[13px] text-white leading-relaxed">
                            {event.label}
                        </p>
                    </div>

                    {/* Response Options */}
                    <div className="space-y-2">
                        <div className="font-mono text-[9px] tracking-[1px] text-[var(--text-secondary)] mb-3">
                            SELECT RESPONSE
                        </div>

                        {event.responseOptions?.map(option => {
                            const affordable = canAfford(option.cost);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onRespond(event.id, option.id)}
                                    disabled={!affordable}
                                    className={`
                                        w-full p-3 rounded border text-left transition-all
                                        ${affordable
                                            ? 'bg-[var(--bg-card)] border-[var(--border)] hover:border-accent hover:bg-accent/10'
                                            : 'bg-[var(--bg-card)] border-[var(--border)] opacity-40 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-mono text-[11px] text-white font-semibold">
                                            {option.label}
                                        </span>

                                        {/* Cost */}
                                        {Object.keys(option.cost).length > 0 && (
                                            <div className="flex items-center gap-2">
                                                {option.cost.budget && (
                                                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                                                        ${option.cost.budget}
                                                    </span>
                                                )}
                                                {option.cost.agents && (
                                                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                                                        {option.cost.agents}A
                                                    </span>
                                                )}
                                                {option.cost.dataCredits && (
                                                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                                                        {option.cost.dataCredits}DC
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <p className="font-body text-[9px] text-[var(--text-secondary)] leading-relaxed">
                                        {option.effect}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="font-mono text-[7px] tracking-[1px] text-[var(--text-secondary)]">
                        SOURCE: {event.source}
                    </span>
                    <button
                        onClick={onDismiss}
                        className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        IGNORE [ESC]
                    </button>
                </div>
            </div>
        </div>
    );
}
