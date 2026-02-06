// engine/objectives.ts - Game objective generator and tracker

import type { GameObjective, Entity } from '../data/ontology';
import { mulberry32 } from './seed';

/**
 * Generate initial objectives for the operation
 */
export function generateObjectives(entities: Entity[], elapsedMinutes: number): GameObjective[] {
    const objectives: GameObjective[] = [];
    const rng = mulberry32(Date.now());

    // Objective 1: Prevent critical threats
    const criticalEntities = entities.filter(e => e.threat === 'critical');
    if (criticalEntities.length > 0) {
        objectives.push({
            id: 'obj_prevent_critical',
            title: 'PREVENT: Operation Ghost Protocol',
            description: 'Investigate all critical entities before they execute their operation',
            type: 'prevent',
            target: {
                threatLevel: 'critical',
                count: criticalEntities.length,
                timeLimit: 60, // 60 minutes
            },
            reward: {
                influence: 100,
                budget: 2000,
            },
            status: 'active',
            progress: 0,
        });
    }

    // Objective 2: Resolve high-priority targets
    const highEntities = entities.filter(e => e.threat === 'high');
    if (highEntities.length >= 3) {
        objectives.push({
            id: 'obj_resolve_high',
            title: 'RESOLVE: Network Disruption',
            description: 'Mark 3 high-priority entities as resolved through investigation',
            type: 'resolve',
            target: {
                threatLevel: 'high',
                count: 3,
            },
            reward: {
                influence: 50,
                budget: 1000,
            },
            status: 'active',
            progress: 0,
        });
    }

    // Objective 3: Maintain operational security
    objectives.push({
        id: 'obj_maintain_budget',
        title: 'MAINTAIN: Resource Management',
        description: 'Keep budget above $5,000 for the next 30 minutes',
        type: 'maintain',
        target: {
            count: 5000, // minimum budget threshold
            timeLimit: 30,
        },
        reward: {
            influence: 25,
        },
        status: 'active',
        progress: 100,
    });

    // Objective 4: Investigation depth
    objectives.push({
        id: 'obj_investigate_deep',
        title: 'INVESTIGATE: Deep Analysis Protocol',
        description: 'Reach investigation level 3 on any 2 entities',
        type: 'investigate',
        target: {
            count: 2,
        },
        reward: {
            influence: 40,
            budget: 500,
        },
        status: 'active',
        progress: 0,
    });

    return objectives;
}

/**
 * Update objective progress based on current state
 */
export function updateObjectiveProgress(
    objectives: GameObjective[],
    entities: Entity[],
    playerResources: any
): GameObjective[] {
    return objectives.map(obj => {
        const updated = { ...obj };

        switch (obj.id) {
            case 'obj_prevent_critical':
                const criticalEntities = entities.filter(e => e.threat === 'critical');
                const investigatedCritical = criticalEntities.filter(
                    e => e.playerFlags?.investigated || e.playerFlags?.resolved
                );
                updated.progress = criticalEntities.length > 0
                    ? Math.round((investigatedCritical.length / criticalEntities.length) * 100)
                    : 100;
                if (updated.progress >= 100 && obj.status === 'active') {
                    updated.status = 'completed';
                }
                break;

            case 'obj_resolve_high':
                const resolvedHigh = entities.filter(
                    e => e.threat === 'high' && e.playerFlags?.resolved
                );
                updated.progress = Math.min(100, Math.round((resolvedHigh.length / 3) * 100));
                if (resolvedHigh.length >= 3 && obj.status === 'active') {
                    updated.status = 'completed';
                }
                break;

            case 'obj_maintain_budget':
                updated.progress = playerResources.budget >= 5000 ? 100 : Math.round((playerResources.budget / 5000) * 100);
                if (updated.progress < 100 && obj.status === 'active') {
                    updated.status = 'failed';
                }
                break;

            case 'obj_investigate_deep':
                const deepInvestigations = entities.filter(
                    e => e.investigationLevel && e.investigationLevel >= 3
                );
                updated.progress = Math.min(100, Math.round((deepInvestigations.length / 2) * 100));
                if (deepInvestigations.length >= 2 && obj.status === 'active') {
                    updated.status = 'completed';
                }
                break;
        }

        return updated;
    });
}

/**
 * Apply rewards for completed objectives
 */
export function applyObjectiveRewards(
    objective: GameObjective,
    playerResources: any
): any {
    if (objective.status !== 'completed') return playerResources;

    return {
        ...playerResources,
        influence: (playerResources.influence || 0) + (objective.reward.influence || 0),
        budget: Math.min(
            playerResources.maxBudget,
            playerResources.budget + (objective.reward.budget || 0)
        ),
    };
}
