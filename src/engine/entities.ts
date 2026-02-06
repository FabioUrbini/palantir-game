// engine/entities.ts - Entity pool + time-based entity spawner

import type { Entity } from '../data/ontology';
import { mulberry32, pickRandom } from './seed';
import {
    PERSON_NAMES,
    COMPANY_NAMES,
    LOCATION_NAMES,
    CYBER_NAMES,
    FINANCIAL_NAMES,
    COMMS_NAMES,
    CITIES,
    DESCRIPTIONS,
    SOURCE_DEFINITIONS,
} from '../data/templates';

const BASE_ENTITY_COUNT = 12;
const MAX_ENTITIES = 30;

type EntityType = Entity['type'];

function pickName(type: EntityType, rng: () => number): string {
    switch (type) {
        case 'person':
            return pickRandom(PERSON_NAMES, rng);
        case 'company':
        case 'organization':
            return pickRandom(COMPANY_NAMES, rng);
        case 'location':
            return pickRandom(LOCATION_NAMES, rng);
        case 'cyber':
            return pickRandom(CYBER_NAMES, rng);
        case 'financial':
            return pickRandom(FINANCIAL_NAMES, rng);
        case 'comms':
            return pickRandom(COMMS_NAMES, rng);
        default:
            return pickRandom(PERSON_NAMES, rng);
    }
}

function pickThreat(rng: () => number): 'critical' | 'high' | 'medium' | 'low' {
    const roll = rng();
    if (roll < 0.1) return 'critical';
    if (roll < 0.3) return 'high';
    if (roll < 0.6) return 'medium';
    return 'low';
}

function pickDescription(type: EntityType, rng: () => number): string {
    const pool = DESCRIPTIONS[type] || DESCRIPTIONS.default;
    return pickRandom(pool, rng);
}

function pickSources(rng: () => number): string[] {
    const count = Math.floor(rng() * 3) + 1; // 1-3 sources
    const available = SOURCE_DEFINITIONS.map(s => s.id);
    const sources: string[] = [];
    for (let i = 0; i < count; i++) {
        const source = pickRandom(available, rng);
        if (!sources.includes(source)) {
            sources.push(source);
        }
    }
    return sources;
}

function createEntity(
    id: number,
    type: EntityType,
    rng: () => number,
    spawnedAt?: number
): Entity {
    const city = pickRandom(CITIES, rng);
    const risk = Math.floor(rng() * 60) + 20;
    const threat = risk >= 85 ? 'critical'
        : risk >= 60 ? 'high'
            : risk >= 35 ? 'medium'
                : 'low';

    return {
        id,
        name: pickName(type, rng),
        type,
        threat,
        risk,
        x: Math.floor(rng() * 700) + 50,
        y: Math.floor(rng() * 450) + 50,
        lat: city.lat,
        lng: city.lng,
        city: city.name,
        desc: pickDescription(type, rng),
        sources: pickSources(rng),
        spawnedAt,
    };
}

/**
 * Generate the base entities (always present from the start)
 */
export function generateBaseEntities(): Entity[] {
    const baseRng = mulberry32(42); // Fixed seed for base entities
    const entities: Entity[] = [];

    const types: EntityType[] = [
        'person', 'person', 'person', 'person',
        'company', 'company',
        'organization',
        'location', 'location',
        'financial',
        'cyber',
        'comms',
    ];

    for (let i = 0; i < BASE_ENTITY_COUNT; i++) {
        entities.push(createEntity(i + 1, types[i], baseRng));
    }

    return entities;
}

/**
 * Generate time-spawned entities (new ones appear over hours)
 */
export function generateSpawnedEntities(elapsedHours: number): Entity[] {
    const spawned: Entity[] = [];

    for (let h = 0; h < elapsedHours; h++) {
        const rng = mulberry32(h * 7919); // unique seed per hour
        if (rng() > 0.6) continue; // 40% chance per hour

        if (BASE_ENTITY_COUNT + spawned.length >= MAX_ENTITIES) break;

        const typeRoll = rng();
        const type: EntityType =
            typeRoll < 0.25 ? 'person'
                : typeRoll < 0.45 ? 'company'
                    : typeRoll < 0.60 ? 'location'
                        : typeRoll < 0.75 ? 'financial'
                            : typeRoll < 0.85 ? 'cyber'
                                : 'comms';

        spawned.push(createEntity(100 + h, type, rng, h));
    }

    return spawned;
}

/**
 * Update risk scores based on time (risk drift)
 */
export function updateRiskScores(entities: Entity[], elapsedMinutes: number): Entity[] {
    return entities.map(entity => {
        const rng = mulberry32(entity.id * 1000 + elapsedMinutes);

        // Drift: -3 to +5 per cycle (slight upward bias for tension)
        const drift = Math.floor(rng() * 9) - 3;
        const newRisk = Math.max(5, Math.min(100, entity.risk + drift));

        // Recalculate threat level from risk
        const threat: Entity['threat'] =
            newRisk >= 85 ? 'critical'
                : newRisk >= 60 ? 'high'
                    : newRisk >= 35 ? 'medium'
                        : 'low';

        return { ...entity, risk: newRisk, threat };
    });
}
