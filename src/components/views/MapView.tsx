'use client';

// components/views/MapView.tsx - SVG geospatial intelligence map

import type { Entity, Connection } from '../../data/ontology';
import { ENTITY_ICONS, THREAT_COLORS, ENTITY_COLORS } from '../../data/theme';

interface MapViewProps {
    entities: Entity[];
    connections: Connection[];
    selectedEntityId: number | null;
    enabledSources: Set<string>;
    onEntitySelect: (id: number | null) => void;
}

// Simple Mercator projection
function projectLat(lat: number): number {
    // Map lat (-90 to 90) to y (100% to 0%)
    return ((90 - lat) / 180) * 100;
}

function projectLng(lng: number): number {
    // Map lng (-180 to 180) to x (0% to 100%)
    return ((lng + 180) / 360) * 100;
}

export default function MapView({
    entities,
    connections,
    selectedEntityId,
    enabledSources,
    onEntitySelect,
}: MapViewProps) {
    // Filter entities by enabled sources and those with coordinates
    const filteredEntities = entities.filter(e =>
        e.sources.some(s => enabledSources.has(s)) && e.lat !== null && e.lng !== null
    );

    const filteredConnections = connections.filter(c => {
        const fromEntity = filteredEntities.find(e => e.id === c.from);
        const toEntity = filteredEntities.find(e => e.id === c.to);
        return fromEntity && toEntity;
    });

    return (
        <div className="w-full h-full relative bg-bg-primary overflow-hidden">
            <svg
                viewBox="0 0 100 60"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid slice"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onEntitySelect(null);
                }}
            >
                <defs>
                    <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                        <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="0.1" />
                    </pattern>
                </defs>

                {/* Background */}
                <rect x="0" y="0" width="100" height="60" fill="var(--bg-primary)" />
                <rect x="0" y="0" width="100" height="60" fill="url(#grid)" />

                {/* Simplified continent outlines */}
                <g stroke="rgba(0, 229, 255, 0.15)" strokeWidth="0.2" fill="rgba(0, 229, 255, 0.02)">
                    {/* Europe */}
                    <ellipse cx="52" cy="22" rx="8" ry="6" />
                    {/* Asia */}
                    <ellipse cx="70" cy="25" rx="15" ry="10" />
                    {/* Africa */}
                    <ellipse cx="52" cy="35" rx="6" ry="8" />
                    {/* North America */}
                    <ellipse cx="25" cy="22" rx="10" ry="8" />
                    {/* South America */}
                    <ellipse cx="30" cy="40" rx="5" ry="8" />
                    {/* Australia */}
                    <ellipse cx="82" cy="42" rx="4" ry="3" />
                </g>

                {/* Connection lines */}
                {filteredConnections.map((conn, idx) => {
                    const fromEntity = filteredEntities.find(e => e.id === conn.from);
                    const toEntity = filteredEntities.find(e => e.id === conn.to);
                    if (!fromEntity || !toEntity) return null;

                    const x1 = projectLng(fromEntity.lng!);
                    const y1 = projectLat(fromEntity.lat!);
                    const x2 = projectLng(toEntity.lng!);
                    const y2 = projectLat(toEntity.lat!);

                    const isRelated = selectedEntityId !== null &&
                        (conn.from === selectedEntityId || conn.to === selectedEntityId);

                    return (
                        <line
                            key={idx}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={isRelated ? 'rgba(0, 229, 255, 0.6)' : 'rgba(0, 229, 255, 0.15)'}
                            strokeWidth={isRelated ? 0.3 : 0.15}
                            strokeDasharray={isRelated ? 'none' : '0.5 0.5'}
                        />
                    );
                })}

                {/* Entity markers */}
                {filteredEntities.map(entity => {
                    const x = projectLng(entity.lng!);
                    const y = projectLat(entity.lat!);
                    const isSelected = entity.id === selectedEntityId;
                    const color = ENTITY_COLORS[entity.type] || '#00e5ff';
                    const threatColor = THREAT_COLORS[entity.threat];

                    return (
                        <g
                            key={entity.id}
                            transform={`translate(${x}, ${y})`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEntitySelect(entity.id);
                            }}
                            className="cursor-pointer"
                        >
                            {/* Pulse ring for critical */}
                            {entity.threat === 'critical' && (
                                <circle
                                    r="2"
                                    fill="none"
                                    stroke={threatColor}
                                    strokeWidth="0.15"
                                    opacity="0.5"
                                    className="animate-ring-pulse"
                                />
                            )}

                            {/* Selection ring */}
                            {isSelected && (
                                <circle
                                    r="1.5"
                                    fill="none"
                                    stroke="#00e5ff"
                                    strokeWidth="0.2"
                                />
                            )}

                            {/* Main marker */}
                            <circle
                                r="1"
                                fill={`${color}60`}
                                stroke={color}
                                strokeWidth="0.15"
                            />

                            {/* Center dot */}
                            <circle
                                r="0.3"
                                fill={color}
                            />

                            {/* Label */}
                            {isSelected && (
                                <>
                                    <rect
                                        x="-6"
                                        y="1.5"
                                        width="12"
                                        height="2"
                                        fill="rgba(0, 0, 0, 0.8)"
                                        rx="0.2"
                                    />
                                    <text
                                        y="2.8"
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="0.8"
                                        fontFamily="'JetBrains Mono', monospace"
                                    >
                                        {entity.name.length > 15 ? entity.name.substring(0, 15) + '...' : entity.name}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Coordinate overlay */}
            <div className="absolute bottom-4 left-4 p-2 bg-bg-panel border border-[var(--border)] rounded">
                <div className="font-mono text-[8px] text-[var(--text-secondary)] tracking-[1px] mb-1">
                    PROJECTION: MERCATOR
                </div>
                <div className="font-mono text-[10px] text-accent">
                    {filteredEntities.length} GEOLOCATED ENTITIES
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 left-4 p-2 bg-bg-panel border border-[var(--border)] rounded">
                <div className="font-mono text-[8px] text-[var(--text-secondary)] tracking-[1px] mb-2">
                    THREAT LEVELS
                </div>
                {['critical', 'high', 'medium', 'low'].map(level => (
                    <div key={level} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: THREAT_COLORS[level] }}
                        />
                        <span className="font-mono text-[8px] text-white uppercase">{level}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
