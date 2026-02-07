// engine/generator.ts - Master procedural data generator with objectives

import type { SimulationState } from '../data/ontology';
import { generateBaseEntities, generateSpawnedEntities, updateRiskScores } from './entities';
import { generateConnections } from './connections';
import { generateEvents, generateAlerts } from './events';
import { generateDataSources } from './sources';
import { getOperationPhase } from './narrative';
import { generateObjectives } from './objectives';
import { getInitialAchievements } from './achievements';

// Operation start (epoch)
const EPOCH = new Date('2025-11-01T00:00:00Z').getTime();

/**
 * Get the complete simulation state for the current timestamp
 * All data is deterministically generated from the current time
 * @param timeSpeed - Time multiplier (1-50x), defaults to 1
 */
export function getSimulationState(timeSpeed: number = 1): SimulationState {
    const now = Date.now();
    const elapsed = (now - EPOCH) * timeSpeed;

    // Handle case where current time is before the epoch
    const clampedElapsed = Math.max(0, elapsed);

    const elapsedMinutes = Math.floor(clampedElapsed / 60000);
    const elapsedHours = Math.floor(clampedElapsed / 3600000);
    const elapsedDays = Math.floor(clampedElapsed / 86400000);

    // 1. Generate base entities (always present)
    const baseEntities = generateBaseEntities();

    // 2. Generate time-spawned entities (new ones appear over hours)
    const spawnedEntities = generateSpawnedEntities(elapsedHours);

    // 3. All entities combined
    const allEntities = [...baseEntities, ...spawnedEntities];

    // 4. Update risk scores based on time (creates risk drift)
    const entitiesWithRisk = updateRiskScores(allEntities, elapsedMinutes);

    // 5. Generate connections between existing entities
    const connections = generateConnections(entitiesWithRisk, elapsedHours);

    // 6. Generate timeline events (new ones every few minutes)
    const events = generateEvents(entitiesWithRisk, elapsedMinutes);

    // 7. Generate current alerts
    const alerts = generateAlerts(entitiesWithRisk, elapsedMinutes);

    // 8. Generate data sources with current state
    const sources = generateDataSources(elapsedMinutes);

    // 9. Determine operation phase
    const phase = getOperationPhase(elapsedDays);

    // 10. Generate initial objectives (will be managed by useSimulation)
    const objectives = generateObjectives(entitiesWithRisk, elapsedMinutes);

    return {
        entities: entitiesWithRisk,
        connections,
        events,
        alerts,
        sources,
        phase,
        elapsedMinutes,
        elapsedHours,
        elapsedDays,
        tick: now,
        playerResources: {
            budget: 10000,
            maxBudget: 10000,
            agents: 8,
            maxAgents: 10,
            dataCredits: 10,
            influence: 50,
        },
        objectives,
        consequenceLogs: [],
        achievements: getInitialAchievements(),
        totalScore: 0,
    };
}

/**
 * Get the epoch timestamp for the operation
 */
export function getEpoch(): number {
    return EPOCH;
}
