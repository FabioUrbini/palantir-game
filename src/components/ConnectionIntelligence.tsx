'use client';

// components/ConnectionIntelligence.tsx - Display detailed connection intelligence

import type { Connection, Entity } from '../data/ontology';
import { getConnectionTypeInfo, getConnectionHealth } from '../engine/relationships';

interface ConnectionIntelligenceProps {
    connection: Connection;
    fromEntity: Entity;
    toEntity: Entity;
    onDisrupt?: (connectionId: string) => void;
    canDisrupt: boolean;
}

export default function ConnectionIntelligence({
    connection,
    fromEntity,
    toEntity,
    onDisrupt,
    canDisrupt,
}: ConnectionIntelligenceProps) {
    const typeInfo = connection.connectionType
        ? getConnectionTypeInfo(connection.connectionType)
        : null;
    const health = getConnectionHealth(connection);
    const metadata = connection.metadata;

    const strengthPercent = Math.round(connection.strength * 100);

    return (
        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {typeInfo && (
                        <span className="text-lg" title={typeInfo.description}>
                            {typeInfo.icon}
                        </span>
                    )}
                    <div>
                        <div className="font-mono text-[9px] text-white font-semibold">
                            {typeInfo?.displayName || connection.type}
                        </div>
                        <div className="font-mono text-[8px] text-[var(--text-secondary)]">
                            {fromEntity.name} ↔ {toEntity.name}
                        </div>
                    </div>
                </div>
                <div
                    className="font-mono text-[8px] font-semibold px-2 py-1 rounded"
                    style={{
                        backgroundColor: `${health.color}20`,
                        color: health.color,
                    }}
                >
                    {health.status.toUpperCase()}
                </div>
            </div>

            {/* Strength Bar */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                        Connection Strength
                    </span>
                    <span className="font-mono text-[8px] font-bold" style={{ color: health.color }}>
                        {strengthPercent}%
                    </span>
                </div>
                <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{
                            width: `${strengthPercent}%`,
                            backgroundColor: health.color,
                        }}
                    />
                </div>
            </div>

            {/* Metadata */}
            {metadata && (
                <div className="space-y-1 mb-2">
                    {/* Activity Frequency */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                            Activity Level
                        </span>
                        <span className="font-mono text-[8px] text-white">
                            {Math.round(metadata.activityFrequency)}%
                        </span>
                    </div>

                    {/* Evidence */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                            Evidence Points
                        </span>
                        <span className="font-mono text-[8px] text-white">
                            {connection.evidence}
                        </span>
                    </div>

                    {/* Last Active */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                            Last Active
                        </span>
                        <span className="font-mono text-[8px] text-white">
                            {getTimeAgo(metadata.lastActive)}
                        </span>
                    </div>

                    {/* Reform Progress (if disrupted) */}
                    {metadata.disrupted && metadata.canReform && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-[8px] text-[var(--threat-medium)]">
                                    🔄 Reforming
                                </span>
                                <span className="font-mono text-[8px] text-[var(--threat-medium)]">
                                    {Math.round(metadata.reformProgress || 0)}%
                                </span>
                            </div>
                            <div className="h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[var(--threat-medium)] transition-all duration-500"
                                    style={{ width: `${metadata.reformProgress || 0}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Permanently Disrupted */}
                    {metadata.disrupted && !metadata.canReform && (
                        <div className="mt-2 px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--threat-critical)]">
                            <span className="font-mono text-[8px] text-[var(--threat-critical)]">
                                ⛔ PERMANENTLY DISRUPTED
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Description */}
            {typeInfo && (
                <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <p className="font-mono text-[8px] text-[var(--text-secondary)]">
                        {typeInfo.description}
                    </p>
                </div>
            )}

            {/* Disrupt Button */}
            {onDisrupt && !metadata?.disrupted && (
                <button
                    onClick={() => onDisrupt(`${connection.from}-${connection.to}`)}
                    disabled={!canDisrupt}
                    className={`w-full mt-2 px-3 py-2 rounded font-mono text-[9px] font-semibold transition-all ${
                        canDisrupt
                            ? 'bg-[var(--threat-critical)]/20 text-[var(--threat-critical)] hover:bg-[var(--threat-critical)]/30 border border-[var(--threat-critical)]/50'
                            : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] cursor-not-allowed'
                    }`}
                >
                    🚨 DISRUPT CONNECTION ($500)
                </button>
            )}
        </div>
    );
}

function getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Network fragmentation indicator component
 */
interface NetworkFragmentationProps {
    fragmentationScore: number;
}

export function NetworkFragmentationIndicator({ fragmentationScore }: NetworkFragmentationProps) {
    const getStatusColor = (score: number): string => {
        if (score < 25) return 'var(--threat-low)';
        if (score < 50) return 'var(--threat-medium)';
        if (score < 75) return 'var(--threat-high)';
        return 'var(--threat-critical)';
    };

    const getStatusText = (score: number): string => {
        if (score < 25) return 'COHESIVE';
        if (score < 50) return 'STABLE';
        if (score < 75) return 'FRAGMENTED';
        return 'CRITICAL';
    };

    const color = getStatusColor(fragmentationScore);
    const status = getStatusText(fragmentationScore);

    return (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] tracking-[1px] text-[var(--text-secondary)]">
                    NETWORK FRAGMENTATION
                </span>
                <span
                    className="font-mono text-[9px] font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: `${color}20`, color }}
                >
                    {status}
                </span>
            </div>

            <div className="mb-2">
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-500"
                        style={{ width: `${fragmentationScore}%`, backgroundColor: color }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                    {fragmentationScore < 50
                        ? 'Network is holding together'
                        : 'Network showing signs of breakdown'}
                </span>
                <span className="font-mono text-[9px] font-bold" style={{ color }}>
                    {Math.round(fragmentationScore)}%
                </span>
            </div>
        </div>
    );
}
