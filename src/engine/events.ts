// engine/events.ts - Timeline event generator with increased interactive alert frequency

import type { TimelineEvent, Entity, Alert } from '../data/ontology';
import { mulberry32, pickRandom } from './seed';
import { EVENT_TEMPLATES } from '../data/templates';

// Operation start (epoch)
const EPOCH = new Date('2025-11-01T00:00:00Z').getTime();

function pickSeverity(rng: () => number): 'critical' | 'high' | 'medium' | 'low' {
    const roll = rng();
    if (roll < 0.05) return 'critical';
    if (roll < 0.20) return 'high';
    if (roll < 0.50) return 'medium';
    return 'low';
}

function pickEventTemplate(
    type: Entity['type'],
    rng: () => number,
    entityName: string
): string {
    const pool = EVENT_TEMPLATES[type] || EVENT_TEMPLATES.default;
    let template = pickRandom(pool, rng);

    // Replace placeholders
    template = template.replace('{entity}', entityName);
    template = template.replace('{amount}', `${Math.floor(rng() * 900 + 100)}K`);
    template = template.replace('{n}', `${Math.floor(rng() * 20 + 5)}`);

    return template;
}

/**
 * Generate timeline events from the operation start to current minute
 * GAMEPLAY UPDATE: Increased interactive alert frequency for better engagement
 */
export function generateEvents(
    entities: Entity[],
    elapsedMinutes: number
): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    if (entities.length === 0) return events;

    for (let m = 0; m < elapsedMinutes; m++) {
        const rng = mulberry32(m * 4201);

        // ~20% chance of an event each minute
        if (rng() > 0.20) continue;

        const entity = entities[Math.floor(rng() * entities.length)];
        const severity = pickSeverity(rng);
        const source = entity.sources.length > 0
            ? entity.sources[Math.floor(rng() * entity.sources.length)]
            : 'SIGINT';

        const event: TimelineEvent = {
            id: m,
            time: new Date(EPOCH + m * 60000).toISOString(),
            label: pickEventTemplate(entity.type, rng, entity.name),
            entity: entity.id,
            severity,
            source,
        };

        // GAMEPLAY UPDATE: Increased interactive alert frequency
        // Critical events: 80% chance (was 30%)
        // High events: 30% chance (new)
        if (severity === 'critical' && rng() < 0.8) {
            event.requiresResponse = true;
            event.responseDeadline = new Date(EPOCH + m * 60000 + 180000).toISOString(); // 3 min deadline
            event.responseOptions = [
                {
                    id: 'investigate',
                    label: 'Launch Full Investigation',
                    cost: { budget: 500, agents: 2, dataCredits: 2 },
                    effect: 'Dedicate resources to thoroughly investigate this threat. May reveal hidden connections.',
                },
                {
                    id: 'monitor',
                    label: 'Enhanced Monitoring',
                    cost: { agents: 1 },
                    effect: 'Assign an analyst to continuously monitor this entity. Lower cost approach.',
                },
                {
                    id: 'dismiss',
                    label: 'Acknowledge Only',
                    cost: {},
                    effect: 'Mark as reviewed without taking action. Threat may escalate if ignored.',
                },
            ];
        } else if (severity === 'high' && rng() < 0.3) {
            // High-severity events also get interactive alerts (30% chance)
            event.requiresResponse = true;
            event.responseDeadline = new Date(EPOCH + m * 60000 + 240000).toISOString(); // 4 min deadline
            event.responseOptions = [
                {
                    id: 'investigate',
                    label: 'Investigate Further',
                    cost: { budget: 250, agents: 1, dataCredits: 1 },
                    effect: 'Deploy resources to investigate this developing situation.',
                },
                {
                    id: 'monitor',
                    label: 'Monitor Situation',
                    cost: { dataCredits: 1 },
                    effect: 'Continue monitoring without immediate action.',
                },
                {
                    id: 'dismiss',
                    label: 'Mark as Routine',
                    cost: {},
                    effect: 'Classify as routine event. May miss early warning signs.',
                },
            ];
        }

        events.push(event);
    }

    // Return only last 200 events for performance
    return events.slice(-200);
}

/**
 * Generate current alerts from recent events and high-risk entities
 */
export function generateAlerts(
    entities: Entity[],
    elapsedMinutes: number
): Alert[] {
    const alerts: Alert[] = [];
    const rng = mulberry32(elapsedMinutes);

    // High-risk entity alerts
    const criticalEntities = entities.filter(e => e.threat === 'critical');
    const highEntities = entities.filter(e => e.threat === 'high');

    for (const entity of criticalEntities) {
        alerts.push({
            id: entity.id * 1000,
            message: `CRITICAL: ${entity.name} threat level escalated — immediate attention required`,
            severity: 'critical',
            time: new Date().toISOString(),
            entityId: entity.id,
        });
    }

    // Random high-priority alerts
    for (const entity of highEntities.slice(0, 3)) {
        if (rng() > 0.5) {
            alerts.push({
                id: entity.id * 1000 + 1,
                message: `HIGH: New intelligence on ${entity.name} — ${pickEventTemplate(entity.type, rng, entity.name)}`,
                severity: 'high',
                time: new Date().toISOString(),
                entityId: entity.id,
            });
        }
    }

    // Random medium alerts for activity
    const mediumCount = Math.floor(rng() * 3) + 2;
    for (let i = 0; i < mediumCount; i++) {
        const entity = entities[Math.floor(rng() * entities.length)];
        alerts.push({
            id: 10000 + i,
            message: `${entity.sources[0] || 'SIGINT'}: Update on ${entity.name} — ${entity.city} station reporting`,
            severity: 'medium',
            time: new Date().toISOString(),
            entityId: entity.id,
        });
    }

    return alerts.slice(0, 10); // Max 10 alerts
}
