// engine/consequences.ts - Action consequence system

import type { Entity, Connection, ConsequenceLog, TimelineEvent } from '../data/ontology';
import { mulberry32, pickRandom } from './seed';

/**
 * Apply investigation consequences based on investigation level
 */
export function applyInvestigationConsequences(
    entity: Entity,
    entities: Entity[],
    connections: Connection[],
    level: number
): {
    connections: Connection[];
    entity: Entity;
    log: ConsequenceLog | null;
} {
    const result = {
        connections: [...connections],
        entity: { ...entity },
        log: null as ConsequenceLog | null,
    };

    const rng = mulberry32(entity.id * level * 1000);

    // Level 2: Reveal 1-2 hidden connections
    if (level === 2) {
        const potentialTargets = entities.filter(
            e => e.id !== entity.id &&
                !connections.some(c =>
                    (c.from === entity.id && c.to === e.id) ||
                    (c.to === entity.id && c.from === e.id)
                )
        );

        if (potentialTargets.length > 0) {
            const connectionsToReveal = Math.min(2, potentialTargets.length);
            for (let i = 0; i < connectionsToReveal; i++) {
                const targetEntity = potentialTargets[Math.floor(rng() * potentialTargets.length)];
                const connectionTypes = [
                    'Financial Transfer',
                    'Communication',
                    'Associate',
                    'Meeting',
                    'Shared Location'
                ];

                result.connections.push({
                    from: entity.id,
                    to: targetEntity.id,
                    type: pickRandom(connectionTypes, rng),
                    strength: 0.3 + rng() * 0.4,
                    evidence: Math.floor(rng() * 5) + 1,
                });
            }

            result.log = {
                id: `consequence_inv_${entity.id}_${Date.now()}`,
                time: Date.now(),
                type: 'investigation',
                message: `Investigation revealed ${connectionsToReveal} hidden connection(s) to ${entity.name}`,
                entityId: entity.id,
            };
        }
    }

    // Level 3: Reduce threat level significantly
    if (level === 3) {
        const oldRisk = result.entity.risk;
        result.entity.risk = Math.max(0, oldRisk - 30);

        // Recalculate threat level
        if (result.entity.risk < 25) {
            result.entity.threat = 'low';
        } else if (result.entity.risk < 50) {
            result.entity.threat = 'medium';
        } else if (result.entity.risk < 75) {
            result.entity.threat = 'high';
        }

        result.log = {
            id: `consequence_inv_${entity.id}_${Date.now()}`,
            time: Date.now(),
            type: 'investigation',
            message: `Deep investigation reduced ${entity.name} threat level from ${Math.round(oldRisk)} to ${Math.round(result.entity.risk)}`,
            entityId: entity.id,
        };
    }

    return result;
}

/**
 * Apply alert response consequences
 */
export function applyAlertResponseConsequences(
    event: TimelineEvent,
    optionId: string,
    entities: Entity[]
): {
    entities: Entity[];
    log: ConsequenceLog | null;
} {
    const result = {
        entities: [...entities],
        log: null as ConsequenceLog | null,
    };

    const targetEntity = entities.find(e => e.id === event.entity);
    if (!targetEntity) return result;

    const entityIndex = result.entities.findIndex(e => e.id === event.entity);
    if (entityIndex === -1) return result;

    const updatedEntity = { ...result.entities[entityIndex] };

    switch (optionId) {
        case 'investigate':
            // Full investigation reduces risk by 20-40
            const reduction = 20 + Math.random() * 20;
            updatedEntity.risk = Math.max(0, updatedEntity.risk - reduction);

            // Update threat level
            if (updatedEntity.risk < 25) {
                updatedEntity.threat = 'low';
            } else if (updatedEntity.risk < 50) {
                updatedEntity.threat = 'medium';
            } else if (updatedEntity.risk < 75) {
                updatedEntity.threat = 'high';
            }

            result.log = {
                id: `consequence_alert_${event.id}_${Date.now()}`,
                time: Date.now(),
                type: 'alert_response',
                message: `Alert response: Full investigation neutralized ${updatedEntity.name} threat by ${Math.round(reduction)}%`,
                entityId: updatedEntity.id,
            };
            break;

        case 'monitor':
            // Monitoring prevents further escalation (freeze risk)
            updatedEntity.risk = Math.max(0, updatedEntity.risk - 5);

            result.log = {
                id: `consequence_alert_${event.id}_${Date.now()}`,
                time: Date.now(),
                type: 'alert_response',
                message: `Alert response: Enhanced monitoring stabilized ${updatedEntity.name} threat level`,
                entityId: updatedEntity.id,
            };
            break;

        case 'dismiss':
            // Dismissing allows threat to escalate slightly
            updatedEntity.risk = Math.min(100, updatedEntity.risk + 10);

            // Update threat level
            if (updatedEntity.risk >= 75) {
                updatedEntity.threat = 'critical';
            } else if (updatedEntity.risk >= 50) {
                updatedEntity.threat = 'high';
            }

            result.log = {
                id: `consequence_alert_${event.id}_${Date.now()}`,
                time: Date.now(),
                type: 'alert_response',
                message: `Alert dismissed: ${updatedEntity.name} threat escalated by 10%`,
                entityId: updatedEntity.id,
            };
            break;
    }

    result.entities[entityIndex] = updatedEntity;
    return result;
}

/**
 * Get recent consequence logs for display
 */
export function getRecentLogs(logs: ConsequenceLog[], count: number = 5): ConsequenceLog[] {
    return logs
        .sort((a, b) => b.time - a.time)
        .slice(0, count);
}
