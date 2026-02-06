'use client';

// components/views/GraphView.tsx - Canvas-based entity-relationship network

import { useRef, useEffect, useState, useCallback } from 'react';
import type { Entity, Connection } from '../../data/ontology';
import { ENTITY_ICONS, THREAT_COLORS, ENTITY_COLORS } from '../../data/theme';

interface GraphViewProps {
    entities: Entity[];
    connections: Connection[];
    selectedEntityId: number | null;
    enabledSources: Set<string>;
    onEntitySelect: (id: number | null) => void;
}

export default function GraphView({
    entities,
    connections,
    selectedEntityId,
    enabledSources,
    onEntitySelect,
}: GraphViewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [positions, setPositions] = useState<Map<number, { x: number; y: number }>>(new Map());
    const [dragging, setDragging] = useState<number | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    // Filter entities by enabled sources
    const filteredEntities = entities.filter(e =>
        e.sources.some(s => enabledSources.has(s))
    );

    const filteredConnections = connections.filter(c => {
        const fromEntity = filteredEntities.find(e => e.id === c.from);
        const toEntity = filteredEntities.find(e => e.id === c.to);
        return fromEntity && toEntity;
    });

    // Initialize positions
    useEffect(() => {
        const newPositions = new Map<number, { x: number; y: number }>();
        filteredEntities.forEach(entity => {
            if (!positions.has(entity.id)) {
                newPositions.set(entity.id, { x: entity.x, y: entity.y });
            } else {
                newPositions.set(entity.id, positions.get(entity.id)!);
            }
        });
        setPositions(newPositions);
    }, [filteredEntities.length]);

    // Handle resize
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = dimensions.width * dpr;
        canvas.height = dimensions.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.fillStyle = '#050810';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < dimensions.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, dimensions.height);
            ctx.stroke();
        }
        for (let y = 0; y < dimensions.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(dimensions.width, y);
            ctx.stroke();
        }

        // Draw connections
        filteredConnections.forEach(conn => {
            const fromPos = positions.get(conn.from);
            const toPos = positions.get(conn.to);
            if (!fromPos || !toPos) return;

            const isRelated = selectedEntityId !== null &&
                (conn.from === selectedEntityId || conn.to === selectedEntityId);

            ctx.beginPath();
            ctx.moveTo(fromPos.x, fromPos.y);
            ctx.lineTo(toPos.x, toPos.y);

            if (isRelated) {
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
            } else {
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });

        // Draw entities
        filteredEntities.forEach(entity => {
            const pos = positions.get(entity.id);
            if (!pos) return;

            const isSelected = entity.id === selectedEntityId;
            const color = ENTITY_COLORS[entity.type] || '#00e5ff';
            const threatColor = THREAT_COLORS[entity.threat];
            const radius = isSelected ? 20 : 16;

            // Pulse ring for critical entities
            if (entity.threat === 'critical') {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 10, 0, Math.PI * 2);
                ctx.strokeStyle = `${threatColor}40`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Selection ring
            if (isSelected) {
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = '#00e5ff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Main circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `${color}30`;
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icon
            ctx.fillStyle = color;
            ctx.font = `${radius * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(ENTITY_ICONS[entity.type] || '◆', pos.x, pos.y);

            // Label (when selected or hovered)
            if (isSelected) {
                ctx.fillStyle = 'white';
                ctx.font = '10px "JetBrains Mono", monospace';
                ctx.fillText(entity.name, pos.x, pos.y + radius + 14);

                ctx.fillStyle = threatColor;
                ctx.font = '8px "JetBrains Mono", monospace';
                ctx.fillText(entity.threat.toUpperCase(), pos.x, pos.y + radius + 26);
            }
        });

        // Draw legend
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 100, 110);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
        ctx.strokeRect(10, 10, 100, 110);

        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'left';
        ctx.fillText('ENTITY TYPES', 18, 26);

        const types = ['person', 'company', 'location', 'cyber', 'financial'];
        types.forEach((type, i) => {
            const color = ENTITY_COLORS[type];
            const y = 42 + i * 14;
            ctx.fillStyle = color;
            ctx.fillText(ENTITY_ICONS[type] || '◆', 18, y);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(type.toUpperCase(), 32, y);
        });
    }, [filteredEntities, filteredConnections, positions, selectedEntityId, dimensions]);

    // Handle canvas click
    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked entity
        for (const entity of filteredEntities) {
            const pos = positions.get(entity.id);
            if (!pos) continue;

            const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (dist < 20) {
                onEntitySelect(entity.id);
                return;
            }
        }

        // Clicked empty space
        onEntitySelect(null);
    }, [filteredEntities, positions, onEntitySelect]);

    // Handle drag
    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (const entity of filteredEntities) {
            const pos = positions.get(entity.id);
            if (!pos) continue;

            const dist = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
            if (dist < 20) {
                setDragging(entity.id);
                return;
            }
        }
    }, [filteredEntities, positions]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (dragging === null) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.max(20, Math.min(dimensions.width - 20, e.clientX - rect.left));
        const y = Math.max(20, Math.min(dimensions.height - 20, e.clientY - rect.top));

        setPositions(prev => {
            const next = new Map(prev);
            next.set(dragging, { x, y });
            return next;
        });
    }, [dragging, dimensions]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <canvas
                ref={canvasRef}
                style={{ width: dimensions.width, height: dimensions.height }}
                className="cursor-pointer"
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
}
