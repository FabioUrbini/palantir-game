'use client';

// components/views/QueryView.tsx - Ontology query builder with SQL preview

import { useState, useMemo } from 'react';
import type { Entity } from '../../data/ontology';
import { ENTITY_ICONS, THREAT_COLORS, ENTITY_COLORS } from '../../data/theme';
import ProgressRing from '../ui/ProgressRing';

interface QueryViewProps {
    entities: Entity[];
    onEntitySelect: (id: number) => void;
}

type EntityType = Entity['type'];
type ThreatLevel = Entity['threat'];

export default function QueryView({
    entities,
    onEntitySelect,
}: QueryViewProps) {
    const [selectedType, setSelectedType] = useState<EntityType | 'all'>('all');
    const [selectedThreat, setSelectedThreat] = useState<ThreatLevel | 'all'>('all');
    const [minRisk, setMinRisk] = useState(0);
    const [queryLog, setQueryLog] = useState<string[]>([]);

    const types: (EntityType | 'all')[] = [
        'all', 'person', 'company', 'organization', 'location', 'financial', 'cyber', 'comms'
    ];
    const threats: (ThreatLevel | 'all')[] = ['all', 'critical', 'high', 'medium', 'low'];

    // Filter entities based on query
    const results = useMemo(() => {
        return entities.filter(e => {
            if (selectedType !== 'all' && e.type !== selectedType) return false;
            if (selectedThreat !== 'all' && e.threat !== selectedThreat) return false;
            if (e.risk < minRisk) return false;
            return true;
        });
    }, [entities, selectedType, selectedThreat, minRisk]);

    // Generate SQL preview
    const sqlPreview = useMemo(() => {
        let sql = 'SELECT * FROM entities';
        const conditions: string[] = [];

        if (selectedType !== 'all') {
            conditions.push(`type = '${selectedType}'`);
        }
        if (selectedThreat !== 'all') {
            conditions.push(`threat = '${selectedThreat}'`);
        }
        if (minRisk > 0) {
            conditions.push(`risk >= ${minRisk}`);
        }

        if (conditions.length > 0) {
            sql += '\nWHERE ' + conditions.join('\n  AND ');
        }

        sql += '\nORDER BY risk DESC\nLIMIT 50;';
        return sql;
    }, [selectedType, selectedThreat, minRisk]);

    const executeQuery = () => {
        const timestamp = new Date().toLocaleTimeString();
        const log = `[${timestamp}] Query executed: ${results.length} results`;
        setQueryLog(prev => [...prev.slice(-9), log]);
    };

    return (
        <div className="w-full h-full flex">
            {/* Query Builder Panel */}
            <div className="w-[320px] h-full bg-bg-secondary border-r border-[var(--border)] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)]">
                    <h2 className="font-mono text-sm text-white mb-1">Ontology Query Builder</h2>
                    <p className="font-mono text-[9px] text-[var(--text-secondary)]">
                        Filter and search the entity graph
                    </p>
                </div>

                {/* Filters */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Type filter */}
                    <div>
                        <label className="data-label block mb-2">ENTITY TYPE</label>
                        <div className="flex flex-wrap gap-1.5">
                            {types.map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`px-2 py-1 rounded font-mono text-[8px] tracking-[0.5px] transition-all ${selectedType === type
                                            ? 'bg-accent text-bg-primary'
                                            : 'bg-[var(--accent-ghost)] text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    {type === 'all' ? 'ALL' : type.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Threat filter */}
                    <div>
                        <label className="data-label block mb-2">THREAT LEVEL</label>
                        <div className="flex flex-wrap gap-1.5">
                            {threats.map(threat => (
                                <button
                                    key={threat}
                                    onClick={() => setSelectedThreat(threat)}
                                    className={`px-2 py-1 rounded font-mono text-[8px] tracking-[0.5px] transition-all flex items-center gap-1.5 ${selectedThreat === threat
                                            ? 'bg-accent text-bg-primary'
                                            : 'bg-[var(--accent-ghost)] text-[var(--text-secondary)] hover:text-white'
                                        }`}
                                >
                                    {threat !== 'all' && (
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: THREAT_COLORS[threat] }}
                                        />
                                    )}
                                    {threat.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Risk slider */}
                    <div>
                        <label className="data-label flex justify-between mb-2">
                            <span>MINIMUM RISK</span>
                            <span className="text-accent">{minRisk}</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={minRisk}
                            onChange={(e) => setMinRisk(Number(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-[7px] text-[var(--text-tertiary)] mt-1">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* SQL Preview */}
                    <div>
                        <label className="data-label block mb-2">SQL PREVIEW</label>
                        <pre className="p-3 bg-bg-primary border border-[var(--border)] rounded font-mono text-[9px] text-accent overflow-x-auto">
                            {sqlPreview}
                        </pre>
                    </div>

                    {/* Execute button */}
                    <button
                        onClick={executeQuery}
                        className="w-full py-2 bg-accent text-bg-primary font-mono text-[10px] tracking-[1px] rounded hover:bg-accent/90 transition-colors"
                    >
                        EXECUTE QUERY
                    </button>

                    {/* Query log */}
                    {queryLog.length > 0 && (
                        <div>
                            <label className="data-label block mb-2">QUERY LOG</label>
                            <div className="space-y-1">
                                {queryLog.map((log, i) => (
                                    <div
                                        key={i}
                                        className="font-mono text-[8px] text-[var(--text-secondary)]"
                                    >
                                        {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 h-full overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono text-sm text-white">
                        Results ({results.length})
                    </h3>
                    <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                        {entities.length} total entities in ontology
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.map(entity => {
                        const color = ENTITY_COLORS[entity.type] || 'var(--accent)';

                        return (
                            <button
                                key={entity.id}
                                onClick={() => onEntitySelect(entity.id)}
                                className="p-3 rounded border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-active)] transition-all text-left"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-lg"
                                            style={{ color }}
                                        >
                                            {ENTITY_ICONS[entity.type] || '◆'}
                                        </span>
                                        <div>
                                            <div className="font-mono text-[10px] text-white">
                                                {entity.name}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span
                                                    className="font-mono text-[7px] px-1 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: `${color}20`,
                                                        color: color,
                                                    }}
                                                >
                                                    {entity.type.toUpperCase()}
                                                </span>
                                                <span
                                                    className="font-mono text-[7px] px-1 py-0.5 rounded"
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
                                    <ProgressRing
                                        value={entity.risk}
                                        size={36}
                                        strokeWidth={3}
                                        color={THREAT_COLORS[entity.threat]}
                                    />
                                </div>

                                <p className="font-body text-[9px] text-[var(--text-secondary)] line-clamp-2 mb-2">
                                    {entity.desc}
                                </p>

                                <div className="flex flex-wrap gap-1">
                                    {entity.sources.map(source => (
                                        <span
                                            key={source}
                                            className="font-mono text-[6px] px-1 py-0.5 rounded bg-[var(--accent-ghost)] text-[var(--text-secondary)]"
                                        >
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {results.length === 0 && (
                    <div className="text-center py-12">
                        <div className="font-mono text-2xl text-[var(--text-tertiary)] mb-2">∅</div>
                        <p className="font-mono text-[10px] text-[var(--text-secondary)]">
                            No entities match the current query
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
