// engine/connections.ts - Connection generator between entities

import type { Connection, Entity } from '../data/ontology';
import { mulberry32, pickRandom } from './seed';
import { CONNECTION_TYPES } from '../data/templates';

function pickConnectionType(
    typeA: Entity['type'],
    typeB: Entity['type'],
    rng: () => number
): string {
    // Create a normalized key (sorted to avoid duplicates)
    const types = [typeA, typeB].sort();
    const key = `${types[0]}-${types[1]}`;

    const pool = CONNECTION_TYPES[key] || CONNECTION_TYPES.default;
    return pickRandom(pool, rng);
}

/**
 * Generate connections between entities
 * Connections form based on shared sources and random chance
 */
export function generateConnections(
    entities: Entity[],
    elapsedHours: number
): Connection[] {
    const connections: Connection[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
            const a = entities[i];
            const b = entities[j];
            const rng = mulberry32(a.id * 997 + b.id * 991 + elapsedHours);

            // Shared sources increase connection probability
            const sharedSources = a.sources.filter(s => b.sources.includes(s)).length;
            const prob = 0.05 + sharedSources * 0.15;

            if (rng() > prob) continue;

            const key = `${Math.min(a.id, b.id)}-${Math.max(a.id, b.id)}`;
            if (seen.has(key)) continue;
            seen.add(key);

            connections.push({
                from: a.id,
                to: b.id,
                type: pickConnectionType(a.type, b.type, rng),
                strength: 0.2 + rng() * 0.8,
                evidence: Math.floor(rng() * 20) + 1,
            });
        }
    }

    return connections;
}
