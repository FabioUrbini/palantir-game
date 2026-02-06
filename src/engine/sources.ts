// engine/sources.ts - Data source state + live counter logic

import type { DataSource } from '../data/ontology';
import { mulberry32 } from './seed';
import { SOURCE_DEFINITIONS } from '../data/templates';

// Operation start (epoch)
const EPOCH = new Date('2025-11-01T00:00:00Z').getTime();

/**
 * Generate initial data source states
 */
export function generateDataSources(elapsedMinutes: number): DataSource[] {
    const rng = mulberry32(elapsedMinutes);

    return SOURCE_DEFINITIONS.map(def => {
        // Base rate varies by source type
        const baseRate = getBaseRate(def.type);
        const rateVariance = rng() * 0.4 + 0.8; // 0.8 - 1.2x multiplier
        const rate = Math.round(baseRate * rateVariance * 100) / 100;

        // Calculate records based on elapsed time and rate
        const baseRecords = Math.floor(elapsedMinutes * rate * 60);
        const recordVariance = Math.floor(rng() * 1000);
        const records = baseRecords + recordVariance;

        // Small chance of degraded status
        const status: 'active' | 'degraded' = rng() < 0.05 ? 'degraded' : 'active';

        // Confidence higher for active sources
        const confidence = status === 'active'
            ? 0.85 + rng() * 0.15
            : 0.5 + rng() * 0.2;

        return {
            id: def.id,
            name: def.name,
            type: def.type,
            status,
            records,
            rate,
            confidence,
        };
    });
}

function getBaseRate(type: string): number {
    switch (type) {
        case 'signals': return 2.5;
        case 'financial': return 1.8;
        case 'open': return 3.2;
        case 'human': return 0.3;
        case 'geospatial': return 0.8;
        case 'cyber': return 4.1;
        case 'satellite': return 0.5;
        case 'social': return 5.2;
        default: return 1.0;
    }
}

/**
 * Update source counters with the current tick
 */
export function updateSourceCounters(
    sources: DataSource[],
    tickDelta: number
): DataSource[] {
    return sources.map(source => {
        // Add records based on rate and time delta
        const newRecords = source.records + Math.floor(source.rate * tickDelta);
        return { ...source, records: newRecords };
    });
}

/**
 * Calculate aggregate statistics
 */
export function getSourceStats(sources: DataSource[]): {
    totalEventsPerSec: number;
    averageConfidence: number;
    activeSources: number;
} {
    const activeSources = sources.filter(s => s.status === 'active');
    const totalEventsPerSec = sources.reduce((sum, s) => sum + s.rate, 0);
    const averageConfidence = sources.length > 0
        ? sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
        : 0;

    return {
        totalEventsPerSec: Math.round(totalEventsPerSec * 100) / 100,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        activeSources: activeSources.length,
    };
}
