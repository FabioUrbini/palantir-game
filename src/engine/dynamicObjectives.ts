// engine/dynamicObjectives.ts - Dynamic procedural objective system

import type { GameObjective, Entity, SimulationState } from '../data/ontology';
import { mulberry32 } from './seed';

export interface ObjectiveChain {
    id: string;
    name: string;
    description: string;
    objectives: GameObjective[];
    currentStep: number;
    unlocked: boolean;
}

export interface HiddenObjective extends GameObjective {
    discoveryCondition: (state: SimulationState) => boolean;
    discovered: boolean;
}

/**
 * Generate procedural objectives based on current game state
 */
export function generateProceduralObjectives(
    entities: Entity[],
    elapsedMinutes: number,
    completedObjectiveIds: string[]
): GameObjective[] {
    const objectives: GameObjective[] = [];
    const rng = mulberry32(Date.now() + elapsedMinutes);

    // Procedural: Target specific entity by location
    const entitiesByCity = groupEntitiesByCity(entities);
    const cities = Object.keys(entitiesByCity).filter(city => entitiesByCity[city].length >= 2);

    if (cities.length > 0 && rng() > 0.5) {
        const targetCity = cities[Math.floor(rng() * cities.length)];
        const cityEntities = entitiesByCity[targetCity];
        const criticalInCity = cityEntities.filter(e => e.threat === 'critical' || e.threat === 'high');

        if (criticalInCity.length > 0) {
            objectives.push({
                id: `obj_proc_city_${targetCity.replace(/\s/g, '_').toLowerCase()}`,
                title: `INTERCEPT: ${targetCity} Operation`,
                description: `Investigate suspicious activity in ${targetCity} - ${criticalInCity.length} entity(s) detected`,
                type: 'investigate',
                target: {
                    count: criticalInCity.length,
                    timeLimit: 45,
                },
                reward: {
                    influence: 30 + (criticalInCity.length * 10),
                    budget: 800,
                },
                status: 'active',
                progress: 0,
            });
        }
    }

    // Procedural: Time-sensitive transaction stop
    const financialEntities = entities.filter(e =>
        e.type === 'financial' || e.type === 'company'
    );

    if (financialEntities.length > 0 && rng() > 0.6) {
        const target = financialEntities[Math.floor(rng() * financialEntities.length)];
        objectives.push({
            id: `obj_proc_transaction_${target.id}`,
            title: 'URGENT: Financial Transaction',
            description: `Stop suspicious transaction from ${target.name} within 30 minutes`,
            type: 'prevent',
            target: {
                entityId: target.id,
                timeLimit: 30,
            },
            reward: {
                influence: 50,
                budget: 1200,
            },
            status: 'active',
            progress: 0,
        });
    }

    // Procedural: Network disruption
    const highThreatCount = entities.filter(e => e.threat === 'high').length;
    if (highThreatCount >= 4 && rng() > 0.4) {
        objectives.push({
            id: 'obj_proc_network_disrupt',
            title: 'DISRUPT: Criminal Network',
            description: `Neutralize ${Math.min(highThreatCount, 5)} high-threat entities in the network`,
            type: 'resolve',
            target: {
                threatLevel: 'high',
                count: Math.min(highThreatCount, 5),
                timeLimit: 60,
            },
            reward: {
                influence: 75,
                budget: 1500,
            },
            status: 'active',
            progress: 0,
        });
    }

    // Procedural: Cyber threat response
    const cyberEntities = entities.filter(e => e.type === 'cyber');
    if (cyberEntities.length >= 2 && rng() > 0.5) {
        objectives.push({
            id: 'obj_proc_cyber_response',
            title: 'DEFEND: Cyber Attack',
            description: `Investigate ${cyberEntities.length} cyber threats before systems are compromised`,
            type: 'investigate',
            target: {
                count: cyberEntities.length,
                timeLimit: 40,
            },
            reward: {
                influence: 60,
                budget: 1000,
            },
            status: 'active',
            progress: 0,
        });
    }

    // Limit to 2-3 procedural objectives at a time
    return objectives.slice(0, Math.floor(rng() * 2) + 2);
}

/**
 * Create objective chains
 */
export function createObjectiveChains(entities: Entity[]): ObjectiveChain[] {
    return [
        {
            id: 'chain_operation_takedown',
            name: 'Operation Takedown',
            description: 'Systematically dismantle the criminal organization',
            unlocked: true,
            currentStep: 0,
            objectives: [
                {
                    id: 'chain_takedown_1',
                    title: 'CHAIN 1: Identify Leaders',
                    description: 'Flag 3 priority targets in the organization',
                    type: 'investigate',
                    target: { count: 3 },
                    reward: { influence: 20, budget: 500 },
                    status: 'active',
                    progress: 0,
                },
                {
                    id: 'chain_takedown_2',
                    title: 'CHAIN 2: Gather Evidence',
                    description: 'Reach investigation level 2 on all flagged targets',
                    type: 'investigate',
                    target: { count: 3 },
                    reward: { influence: 40, budget: 1000 },
                    status: 'active',
                    progress: 0,
                },
                {
                    id: 'chain_takedown_3',
                    title: 'CHAIN 3: Execute Takedown',
                    description: 'Mark all targets as resolved',
                    type: 'resolve',
                    target: { count: 3 },
                    reward: { influence: 100, budget: 2500 },
                    status: 'active',
                    progress: 0,
                },
            ],
        },
        {
            id: 'chain_financial_trail',
            name: 'Follow the Money',
            description: 'Track financial transactions to expose money laundering',
            unlocked: false,
            currentStep: 0,
            objectives: [
                {
                    id: 'chain_financial_1',
                    title: 'CHAIN 1: Identify Transactions',
                    description: 'Investigate 2 financial entities',
                    type: 'investigate',
                    target: { count: 2 },
                    reward: { influence: 30, budget: 800 },
                    status: 'active',
                    progress: 0,
                },
                {
                    id: 'chain_financial_2',
                    title: 'CHAIN 2: Trace the Network',
                    description: 'Use financial investigation path on 3 entities',
                    type: 'investigate',
                    target: { count: 3 },
                    reward: { influence: 50, budget: 1200 },
                    status: 'active',
                    progress: 0,
                },
            ],
        },
    ];
}

/**
 * Generate hidden objectives
 */
export function generateHiddenObjectives(): HiddenObjective[] {
    return [
        {
            id: 'hidden_perfectionist',
            title: 'HIDDEN: Perfectionist',
            description: 'Complete 5 objectives without any failures',
            type: 'investigate',
            target: { count: 5 },
            reward: { influence: 100, budget: 3000 },
            status: 'active',
            progress: 0,
            discovered: false,
            discoveryCondition: (state) => {
                const completed = state.objectives.filter(o => o.status === 'completed').length;
                const failed = state.objectives.filter(o => o.status === 'failed').length;
                return completed >= 3 && failed === 0;
            },
        },
        {
            id: 'hidden_speed_runner',
            title: 'HIDDEN: Speed Runner',
            description: 'Complete 3 objectives in under 20 minutes',
            type: 'investigate',
            target: { count: 3, timeLimit: 20 },
            reward: { influence: 80, budget: 2000 },
            status: 'active',
            progress: 0,
            discovered: false,
            discoveryCondition: (state) => {
                return state.elapsedMinutes <= 20 &&
                       state.objectives.filter(o => o.status === 'completed').length >= 1;
            },
        },
        {
            id: 'hidden_master_investigator',
            title: 'HIDDEN: Master Investigator',
            description: 'Reach max investigation level on 5 entities using all 3 paths',
            type: 'investigate',
            target: { count: 5 },
            reward: { influence: 150, budget: 5000 },
            status: 'active',
            progress: 0,
            discovered: false,
            discoveryCondition: (state) => {
                const maxLevel = state.entities.filter(e =>
                    e.investigationBranches?.some(b => b.level === 3)
                ).length;
                return maxLevel >= 2;
            },
        },
        {
            id: 'hidden_network_breaker',
            title: 'HIDDEN: Network Breaker',
            description: 'Disrupt 10 connections in the criminal network',
            type: 'resolve',
            target: { count: 10 },
            reward: { influence: 120, budget: 3500 },
            status: 'active',
            progress: 0,
            discovered: false,
            discoveryCondition: (state) => {
                const disrupted = state.connections.filter(c =>
                    c.metadata?.disrupted
                ).length;
                return disrupted >= 3;
            },
        },
    ];
}

/**
 * Update procedural objectives progress
 */
export function updateProceduralObjective(
    objective: GameObjective,
    entities: Entity[],
    elapsedMinutes: number
): GameObjective {
    const updated = { ...objective };

    // Check time limit failures
    if (updated.target.timeLimit && elapsedMinutes >= updated.target.timeLimit) {
        if (updated.status === 'active' && (updated.progress || 0) < 100) {
            updated.status = 'failed';
            return updated;
        }
    }

    // City-specific objectives
    if (objective.id.startsWith('obj_proc_city_')) {
        const cityName = objective.id.replace('obj_proc_city_', '').replace(/_/g, ' ');
        const cityEntities = entities.filter(e =>
            e.city.toLowerCase() === cityName.toLowerCase() &&
            (e.threat === 'critical' || e.threat === 'high')
        );
        const investigated = cityEntities.filter(e =>
            e.playerFlags?.investigated || e.playerFlags?.resolved
        );
        updated.progress = cityEntities.length > 0
            ? Math.round((investigated.length / cityEntities.length) * 100)
            : 100;
        if (updated.progress >= 100 && updated.status === 'active') {
            updated.status = 'completed';
        }
    }

    // Transaction objectives
    if (objective.id.startsWith('obj_proc_transaction_')) {
        const entityId = parseInt(objective.id.replace('obj_proc_transaction_', ''));
        const entity = entities.find(e => e.id === entityId);
        if (entity && (entity.playerFlags?.investigated || entity.playerFlags?.resolved)) {
            updated.progress = 100;
            updated.status = 'completed';
        }
    }

    // Network disruption
    if (objective.id === 'obj_proc_network_disrupt') {
        const resolved = entities.filter(e =>
            e.threat === 'high' && e.playerFlags?.resolved
        ).length;
        const targetCount = objective.target.count || 5;
        updated.progress = Math.min(100, Math.round((resolved / targetCount) * 100));
        if (resolved >= targetCount && updated.status === 'active') {
            updated.status = 'completed';
        }
    }

    // Cyber response
    if (objective.id === 'obj_proc_cyber_response') {
        const cyberEntities = entities.filter(e => e.type === 'cyber');
        const investigated = cyberEntities.filter(e =>
            e.playerFlags?.investigated || e.playerFlags?.resolved
        );
        updated.progress = cyberEntities.length > 0
            ? Math.round((investigated.length / cyberEntities.length) * 100)
            : 100;
        if (updated.progress >= 100 && updated.status === 'active') {
            updated.status = 'completed';
        }
    }

    return updated;
}

/**
 * Update objective chains
 */
export function updateObjectiveChains(
    chains: ObjectiveChain[],
    entities: Entity[]
): ObjectiveChain[] {
    return chains.map(chain => {
        const updated = { ...chain };
        const currentObjective = chain.objectives[chain.currentStep];

        if (!currentObjective) return updated;

        // Check progress for chain objectives
        if (chain.id === 'chain_operation_takedown') {
            const priorityEntities = entities.filter(e => e.playerFlags?.priority);

            if (chain.currentStep === 0) {
                currentObjective.progress = Math.min(100, Math.round((priorityEntities.length / 3) * 100));
                if (priorityEntities.length >= 3 && currentObjective.status === 'active') {
                    currentObjective.status = 'completed';
                    updated.currentStep = 1;
                }
            } else if (chain.currentStep === 1) {
                const level2Entities = priorityEntities.filter(e =>
                    e.investigationLevel && e.investigationLevel >= 2
                );
                currentObjective.progress = Math.min(100, Math.round((level2Entities.length / 3) * 100));
                if (level2Entities.length >= 3 && currentObjective.status === 'active') {
                    currentObjective.status = 'completed';
                    updated.currentStep = 2;
                }
            } else if (chain.currentStep === 2) {
                const resolvedPriority = priorityEntities.filter(e => e.playerFlags?.resolved);
                currentObjective.progress = Math.min(100, Math.round((resolvedPriority.length / 3) * 100));
                if (resolvedPriority.length >= 3 && currentObjective.status === 'active') {
                    currentObjective.status = 'completed';
                }
            }
        }

        if (chain.id === 'chain_financial_trail') {
            const financialEntities = entities.filter(e =>
                e.type === 'financial' || e.type === 'company'
            );

            if (chain.currentStep === 0) {
                const investigated = financialEntities.filter(e => e.playerFlags?.investigated);
                currentObjective.progress = Math.min(100, Math.round((investigated.length / 2) * 100));
                if (investigated.length >= 2 && currentObjective.status === 'active') {
                    currentObjective.status = 'completed';
                    updated.currentStep = 1;
                }
            } else if (chain.currentStep === 1) {
                const financialPath = entities.filter(e =>
                    e.investigationBranches?.some(b => b.path === 'financial' && b.level > 0)
                );
                currentObjective.progress = Math.min(100, Math.round((financialPath.length / 3) * 100));
                if (financialPath.length >= 3 && currentObjective.status === 'active') {
                    currentObjective.status = 'completed';
                }
            }
        }

        return updated;
    });
}

/**
 * Check and discover hidden objectives
 */
export function checkHiddenObjectives(
    hiddenObjectives: HiddenObjective[],
    state: SimulationState
): HiddenObjective[] {
    return hiddenObjectives.map(obj => {
        const updated = { ...obj };

        if (!updated.discovered && updated.discoveryCondition(state)) {
            updated.discovered = true;
        }

        // Update progress for discovered objectives
        if (updated.discovered) {
            if (updated.id === 'hidden_perfectionist') {
                const completed = state.objectives.filter(o => o.status === 'completed').length;
                const failed = state.objectives.filter(o => o.status === 'failed').length;
                updated.progress = failed > 0 ? 0 : Math.min(100, (completed / 5) * 100);
                if (completed >= 5 && failed === 0) {
                    updated.status = 'completed';
                }
            }

            if (updated.id === 'hidden_master_investigator') {
                const maxLevel = state.entities.filter(e =>
                    e.investigationBranches?.some(b => b.level === 3)
                ).length;
                updated.progress = Math.min(100, (maxLevel / 5) * 100);
                if (maxLevel >= 5) {
                    updated.status = 'completed';
                }
            }

            if (updated.id === 'hidden_network_breaker') {
                const disrupted = state.connections.filter(c => c.metadata?.disrupted).length;
                updated.progress = Math.min(100, (disrupted / 10) * 100);
                if (disrupted >= 10) {
                    updated.status = 'completed';
                }
            }
        }

        return updated;
    });
}

/**
 * Helper: Group entities by city
 */
function groupEntitiesByCity(entities: Entity[]): { [city: string]: Entity[] } {
    return entities.reduce((acc, entity) => {
        if (!acc[entity.city]) {
            acc[entity.city] = [];
        }
        acc[entity.city].push(entity);
        return acc;
    }, {} as { [city: string]: Entity[] });
}

/**
 * Apply failure consequences
 */
export function applyFailureConsequences(
    objective: GameObjective,
    entities: Entity[]
): { entities: Entity[]; message: string } {
    let message = '';
    let updatedEntities = [...entities];

    if (objective.status !== 'failed') {
        return { entities: updatedEntities, message };
    }

    // Failure consequences based on objective type
    if (objective.type === 'prevent') {
        // Failed to prevent - threats escalate
        updatedEntities = entities.map(e => {
            if (e.threat === 'critical' || e.threat === 'high') {
                return { ...e, risk: Math.min(100, e.risk + 15) };
            }
            return e;
        });
        message = `Failed to prevent operation - threat levels increased by 15%`;
    }

    if (objective.type === 'maintain') {
        // Failed to maintain resources - lose influence
        message = `Resource management failure - operational effectiveness reduced`;
    }

    if (objective.id.startsWith('obj_proc_transaction_')) {
        // Failed to stop transaction
        message = `Transaction completed - criminal network gained $5000`;
    }

    return { entities: updatedEntities, message };
}
