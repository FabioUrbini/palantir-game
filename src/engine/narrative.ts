// engine/narrative.ts - Operation phase progression

import type { Phase } from '../data/ontology';

export const PHASES: Phase[] = [
    {
        name: 'COLLECTION',
        description: 'Initial intelligence gathering. Sources are being correlated.',
        day: 0,
        alertLevel: 'ELEVATED'
    },
    {
        name: 'CORRELATION',
        description: 'Patterns emerging. Entity graph expanding.',
        day: 2,
        alertLevel: 'ELEVATED'
    },
    {
        name: 'IDENTIFICATION',
        description: 'Key actors identified. Network structure mapped.',
        day: 5,
        alertLevel: 'HIGH'
    },
    {
        name: 'TRACKING',
        description: 'Active surveillance on primary targets.',
        day: 8,
        alertLevel: 'HIGH'
    },
    {
        name: 'CONVERGENCE',
        description: 'Multiple threads converging. Operation imminent.',
        day: 12,
        alertLevel: 'CRITICAL'
    },
    {
        name: 'INTERCEPTION',
        description: 'GHOST Protocol timeline confirmed. All stations alert.',
        day: 16,
        alertLevel: 'MAXIMUM'
    },
];

/**
 * Get the current operation phase based on elapsed days
 */
export function getOperationPhase(elapsedDays: number): Phase {
    let current = PHASES[0];
    for (const phase of PHASES) {
        if (elapsedDays >= phase.day) current = phase;
    }
    return current;
}
