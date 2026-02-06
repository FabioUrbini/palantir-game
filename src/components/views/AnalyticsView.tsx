'use client';

// components/views/AnalyticsView.tsx - Recharts dashboard with KPIs and charts

import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import type { Entity, TimelineEvent, DataSource } from '../../data/ontology';
import { THREAT_COLORS, ENTITY_COLORS, SOURCE_COLORS } from '../../data/theme';
import ProgressRing from '../ui/ProgressRing';
import AnimatedNumber from '../ui/AnimatedNumber';
import { mulberry32 } from '../../engine/seed';

interface AnalyticsViewProps {
    entities: Entity[];
    events: TimelineEvent[];
    sources: DataSource[];
    elapsedMinutes: number;
    elapsedDays: number;
}

export default function AnalyticsView({
    entities,
    events,
    sources,
    elapsedMinutes,
    elapsedDays,
}: AnalyticsViewProps) {
    // Calculate statistics
    const threatCounts = {
        critical: entities.filter(e => e.threat === 'critical').length,
        high: entities.filter(e => e.threat === 'high').length,
        medium: entities.filter(e => e.threat === 'medium').length,
        low: entities.filter(e => e.threat === 'low').length,
    };

    const avgRisk = entities.length > 0
        ? Math.round(entities.reduce((sum, e) => sum + e.risk, 0) / entities.length)
        : 0;

    const totalRecords = sources.reduce((sum, s) => sum + s.records, 0);
    const avgConfidence = sources.length > 0
        ? Math.round((sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length) * 100)
        : 0;

    // Generate time-series data for charts
    const rng = mulberry32(elapsedMinutes);
    const threatEvolution = Array.from({ length: 12 }, (_, i) => ({
        day: `D${i + 1}`,
        critical: Math.floor(rng() * 3) + (i > 6 ? 2 : 0),
        high: Math.floor(rng() * 5) + 2,
        medium: Math.floor(rng() * 8) + 4,
        low: Math.floor(rng() * 6) + 3,
    }));

    // Threat distribution for pie chart
    const threatDistribution = [
        { name: 'CRITICAL', value: threatCounts.critical, color: THREAT_COLORS.critical },
        { name: 'HIGH', value: threatCounts.high, color: THREAT_COLORS.high },
        { name: 'MEDIUM', value: threatCounts.medium, color: THREAT_COLORS.medium },
        { name: 'LOW', value: threatCounts.low, color: THREAT_COLORS.low },
    ];

    // Entity type counts for radar
    const typeCounts: Record<string, number> = {};
    entities.forEach(e => {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    });
    const radarData = [
        { type: 'Person', count: typeCounts.person || 0, fullMark: 10 },
        { type: 'Company', count: typeCounts.company || 0, fullMark: 10 },
        { type: 'Location', count: typeCounts.location || 0, fullMark: 10 },
        { type: 'Cyber', count: typeCounts.cyber || 0, fullMark: 10 },
        { type: 'Financial', count: typeCounts.financial || 0, fullMark: 10 },
        { type: 'Comms', count: typeCounts.comms || 0, fullMark: 10 },
    ];

    // Source volume data
    const sourceData = sources.map(s => ({
        name: s.name,
        records: s.records,
        rate: s.rate,
        color: SOURCE_COLORS[s.id] || '#00e5ff',
    }));

    // City distribution
    const cityCounts: Record<string, number> = {};
    entities.forEach(e => {
        cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
    });
    const cityData = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([city, count]) => ({ city, count }));

    return (
        <div className="w-full h-full p-4 overflow-y-auto">
            {/* KPI Cards */}
            <div className="grid grid-cols-6 gap-4 mb-6">
                <KPICard
                    label="TOTAL ENTITIES"
                    value={entities.length}
                    icon="◆"
                    color="#00e5ff"
                />
                <KPICard
                    label="CRITICAL THREATS"
                    value={threatCounts.critical}
                    icon="!"
                    color={THREAT_COLORS.critical}
                />
                <KPICard
                    label="AVERAGE RISK"
                    value={avgRisk}
                    suffix="%"
                    icon="◎"
                    color={avgRisk >= 60 ? THREAT_COLORS.high : THREAT_COLORS.medium}
                />
                <KPICard
                    label="TOTAL EVENTS"
                    value={events.length}
                    icon="≡"
                    color="#7c4dff"
                />
                <KPICard
                    label="DATA RECORDS"
                    value={totalRecords}
                    icon="▤"
                    color="#00e676"
                    format="compact"
                />
                <KPICard
                    label="AVG CONFIDENCE"
                    value={avgConfidence}
                    suffix="%"
                    icon="◉"
                    color={avgConfidence >= 85 ? '#30d158' : '#ffcc00'}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Threat Evolution */}
                <div className="panel p-4 rounded">
                    <h3 className="panel-header mb-3">THREAT EVOLUTION (12 DAYS)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={threatEvolution}>
                            <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(0,229,255,0.2)',
                                    fontSize: 10,
                                }}
                            />
                            <Area type="monotone" dataKey="low" stackId="1" stroke={THREAT_COLORS.low} fill={THREAT_COLORS.low} fillOpacity={0.3} />
                            <Area type="monotone" dataKey="medium" stackId="1" stroke={THREAT_COLORS.medium} fill={THREAT_COLORS.medium} fillOpacity={0.3} />
                            <Area type="monotone" dataKey="high" stackId="1" stroke={THREAT_COLORS.high} fill={THREAT_COLORS.high} fillOpacity={0.3} />
                            <Area type="monotone" dataKey="critical" stackId="1" stroke={THREAT_COLORS.critical} fill={THREAT_COLORS.critical} fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Threat Distribution Donut */}
                <div className="panel p-4 rounded">
                    <h3 className="panel-header mb-3">THREAT DISTRIBUTION</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={threatDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {threatDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(0,229,255,0.2)',
                                    fontSize: 10,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Network Topology Radar */}
                <div className="panel p-4 rounded">
                    <h3 className="panel-header mb-3">NETWORK TOPOLOGY</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(0,229,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="type"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8 }}
                            />
                            <Radar
                                name="Entities"
                                dataKey="count"
                                stroke="#00e5ff"
                                fill="#00e5ff"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Source Volume */}
                <div className="panel p-4 rounded">
                    <h3 className="panel-header mb-3">SOURCE VOLUME</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={sourceData} layout="vertical">
                            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(0,229,255,0.2)',
                                    fontSize: 10,
                                }}
                                formatter={(value: number) => value.toLocaleString()}
                            />
                            <Bar dataKey="records" radius={[0, 4, 4, 0]}>
                                {sourceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Geographic Distribution */}
                <div className="panel p-4 rounded">
                    <h3 className="panel-header mb-3">GEOGRAPHIC DISTRIBUTION</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={cityData} layout="vertical">
                            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                            <YAxis
                                type="category"
                                dataKey="city"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(0,229,255,0.2)',
                                    fontSize: 10,
                                }}
                            />
                            <Bar dataKey="count" fill="#00e5ff" radius={[0, 4, 4, 0]} fillOpacity={0.7} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Entity Risk Matrix */}
            <div className="panel p-4 rounded">
                <h3 className="panel-header mb-3">ENTITY RISK MATRIX</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="data-label pb-2">ENTITY</th>
                                <th className="data-label pb-2">TYPE</th>
                                <th className="data-label pb-2">CITY</th>
                                <th className="data-label pb-2">THREAT</th>
                                <th className="data-label pb-2 w-32">RISK</th>
                                <th className="data-label pb-2">SOURCES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entities
                                .sort((a, b) => b.risk - a.risk)
                                .slice(0, 10)
                                .map(entity => (
                                    <tr key={entity.id} className="border-t border-[var(--border)]">
                                        <td className="py-2 font-mono text-[10px] text-white">{entity.name}</td>
                                        <td className="py-2">
                                            <span
                                                className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${ENTITY_COLORS[entity.type]}20`,
                                                    color: ENTITY_COLORS[entity.type],
                                                }}
                                            >
                                                {entity.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-2 font-mono text-[9px] text-[var(--text-secondary)]">
                                            {entity.city}
                                        </td>
                                        <td className="py-2">
                                            <span
                                                className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${THREAT_COLORS[entity.threat]}20`,
                                                    color: THREAT_COLORS[entity.threat],
                                                }}
                                            >
                                                {entity.threat.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${entity.risk}%`,
                                                            backgroundColor: THREAT_COLORS[entity.threat],
                                                        }}
                                                    />
                                                </div>
                                                <span className="font-mono text-[9px] text-white w-6 text-right">
                                                    {entity.risk}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-2 font-mono text-[8px] text-[var(--text-secondary)]">
                                            {entity.sources.join(', ')}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// KPI Card component
function KPICard({
    label,
    value,
    icon,
    color,
    suffix = '',
    format = 'number',
}: {
    label: string;
    value: number;
    icon: string;
    color: string;
    suffix?: string;
    format?: 'number' | 'compact';
}) {
    const formatValue = (n: number) => {
        if (format === 'compact') {
            if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
            if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
        }
        return n.toLocaleString() + suffix;
    };

    return (
        <div className="panel p-3 rounded">
            <div className="flex items-start justify-between mb-2">
                <span className="data-label">{label}</span>
                <span style={{ color }} className="text-lg">{icon}</span>
            </div>
            <AnimatedNumber
                value={value}
                format={formatValue}
                className="text-2xl"
            />
        </div>
    );
}
