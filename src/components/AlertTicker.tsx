'use client';

// components/AlertTicker.tsx - Scrolling real-time alert feed

import type { Alert } from '../data/ontology';
import { THREAT_COLORS } from '../data/theme';

interface AlertTickerProps {
    alerts: Alert[];
    onAlertClick?: (alert: Alert) => void;
}

export default function AlertTicker({ alerts, onAlertClick }: AlertTickerProps) {
    // Duplicate alerts for seamless loop
    const displayAlerts = [...alerts, ...alerts];

    return (
        <div className="h-7 bg-bg-primary border-b border-[var(--border)] overflow-hidden relative">
            {/* Live indicator */}
            <div className="absolute left-0 top-0 h-full flex items-center z-10 bg-bg-primary pr-2 pl-3">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-threat-critical animate-pulse-custom" />
                    <span className="font-mono text-[8px] tracking-[2px] text-threat-critical font-semibold">
                        LIVE
                    </span>
                </div>
                <div className="w-px h-4 bg-[var(--border)] ml-3" />
            </div>

            {/* Scrolling ticker */}
            <div
                className="flex items-center h-full animate-ticker whitespace-nowrap pl-20"
                style={{ width: 'max-content' }}
            >
                {displayAlerts.map((alert, index) => (
                    <div
                        key={`${alert.id}-${index}`}
                        className={`flex items-center gap-3 mx-6 ${onAlertClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                        onClick={() => onAlertClick?.(alert)}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: THREAT_COLORS[alert.severity] }}
                        />
                        <span
                            className="font-mono text-[9px] tracking-[0.5px]"
                            style={{ color: THREAT_COLORS[alert.severity] }}
                        >
                            {alert.message}
                        </span>
                        {/* Interactive indicator */}
                        {onAlertClick && alert.severity === 'critical' && (
                            <span className="font-mono text-[7px] text-accent">
                                [CLICK TO RESPOND]
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Gradient fade right */}
            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
        </div>
    );
}
