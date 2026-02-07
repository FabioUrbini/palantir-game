// engine/investigation.ts - Multi-stage investigation system

import type { Entity, Evidence, InvestigationBranch, InvestigationPath, Connection } from '../data/ontology';

/**
 * Initialize investigation branches for an entity
 */
export function initializeInvestigationBranches(): InvestigationBranch[] {
    return [
        {
            path: 'financial',
            level: 0,
            evidence: [],
            unlocked: false,
            insights: [],
        },
        {
            path: 'cyber',
            level: 0,
            evidence: [],
            unlocked: false,
            insights: [],
        },
        {
            path: 'humint',
            level: 0,
            evidence: [],
            unlocked: false,
            insights: [],
        },
    ];
}

/**
 * Get the display name and icon for an investigation path
 */
export function getPathInfo(path: InvestigationPath): { name: string; icon: string; description: string } {
    switch (path) {
        case 'financial':
            return {
                name: 'Financial Investigation',
                icon: '💰',
                description: 'Follow the money trail - transactions, accounts, assets',
            };
        case 'cyber':
            return {
                name: 'Cyber Investigation',
                icon: '💻',
                description: 'Digital footprint - communications, networks, data',
            };
        case 'humint':
            return {
                name: 'HUMINT Investigation',
                icon: '👤',
                description: 'Human intelligence - relationships, movements, behavior',
            };
    }
}

/**
 * Generate evidence based on entity type and investigation path
 */
export function generateEvidence(
    entity: Entity,
    path: InvestigationPath,
    level: number,
    seed: number
): Evidence {
    const evidenceId = `${entity.id}-${path}-${level}-${seed}`;

    // Evidence templates based on path and entity type
    const templates = getEvidenceTemplates(entity.type, path, level);
    const template = templates[seed % templates.length];

    // Quality improves with investigation level
    const qualityRoll = (seed * 7919) % 100;
    let quality: 'low' | 'medium' | 'high';
    if (level === 3) {
        quality = qualityRoll < 70 ? 'high' : 'medium';
    } else if (level === 2) {
        quality = qualityRoll < 50 ? 'medium' : 'low';
    } else {
        quality = qualityRoll < 30 ? 'medium' : 'low';
    }

    const impact = quality === 'high' ? 80 + (seed % 20) : quality === 'medium' ? 50 + (seed % 30) : 20 + (seed % 30);

    return {
        id: evidenceId,
        type: template.type,
        title: template.title,
        description: template.description.replace('{name}', entity.name),
        quality,
        discoveredAt: Date.now(),
        relatedPath: path,
        impact,
    };
}

/**
 * Get evidence templates based on entity type and path
 */
function getEvidenceTemplates(
    entityType: string,
    path: InvestigationPath,
    level: number
): Array<{ type: Evidence['type']; title: string; description: string }> {
    const templates: { [key: string]: any } = {
        financial: [
            {
                type: 'transaction',
                title: 'Wire Transfer Records',
                description: 'Suspicious wire transfers from {name} to offshore accounts',
            },
            {
                type: 'document',
                title: 'Bank Statements',
                description: 'Financial records showing unusual activity patterns for {name}',
            },
            {
                type: 'transaction',
                title: 'Cryptocurrency Movements',
                description: 'Digital currency transactions linked to {name}',
            },
            {
                type: 'document',
                title: 'Asset Registry',
                description: 'Hidden assets and properties registered under {name}',
            },
        ],
        cyber: [
            {
                type: 'communication',
                title: 'Encrypted Messages',
                description: 'Intercepted encrypted communications involving {name}',
            },
            {
                type: 'document',
                title: 'Server Logs',
                description: 'Digital footprint and access patterns for {name}',
            },
            {
                type: 'communication',
                title: 'Email Metadata',
                description: 'Communication network analysis for {name}',
            },
            {
                type: 'document',
                title: 'Dark Web Activity',
                description: 'Underground forum posts and transactions linked to {name}',
            },
        ],
        humint: [
            {
                type: 'witness',
                title: 'Witness Statement',
                description: 'Confidential source reports on activities of {name}',
            },
            {
                type: 'recording',
                title: 'Surveillance Footage',
                description: 'Visual confirmation of {name} at key locations',
            },
            {
                type: 'witness',
                title: 'Informant Report',
                description: 'Inside information about {name} from trusted source',
            },
            {
                type: 'recording',
                title: 'Audio Recording',
                description: 'Recorded conversations mentioning {name}',
            },
        ],
    };

    return templates[path] || templates.financial;
}

/**
 * Generate insights based on investigation level and path
 */
export function generateInsights(
    entity: Entity,
    path: InvestigationPath,
    level: number,
    evidence: Evidence[]
): string[] {
    const insights: string[] = [];

    if (level >= 1) {
        insights.push(getBasicInsight(entity, path));
    }
    if (level >= 2) {
        insights.push(getIntermediateInsight(entity, path, evidence));
    }
    if (level >= 3) {
        insights.push(getAdvancedInsight(entity, path, evidence));
    }

    return insights;
}

function getBasicInsight(entity: Entity, path: InvestigationPath): string {
    const insights = {
        financial: `Initial financial analysis reveals ${entity.name} has significant undisclosed assets`,
        cyber: `Digital trace analysis shows ${entity.name} uses advanced encryption and anonymization`,
        humint: `Field reports indicate ${entity.name} maintains multiple residences and aliases`,
    };
    return insights[path];
}

function getIntermediateInsight(entity: Entity, path: InvestigationPath, evidence: Evidence[]): string {
    const highQualityEvidence = evidence.filter(e => e.quality === 'high').length;
    const insights = {
        financial: `Money trail leads to offshore shell companies - ${highQualityEvidence} confirmed transactions`,
        cyber: `Network analysis reveals ${entity.name} communicates with ${highQualityEvidence + 3} other entities in the network`,
        humint: `Behavioral analysis suggests ${entity.name} follows predictable patterns - ${highQualityEvidence} confirmed sightings`,
    };
    return insights[path];
}

function getAdvancedInsight(entity: Entity, path: InvestigationPath, evidence: Evidence[]): string {
    const totalImpact = evidence.reduce((sum, e) => sum + e.impact, 0);
    const avgImpact = Math.floor(totalImpact / (evidence.length || 1));

    const insights = {
        financial: `Complete financial profile reconstructed - evidence quality ${avgImpact}%. Key vulnerabilities identified in asset structure`,
        cyber: `Full digital footprint mapped - evidence quality ${avgImpact}%. Critical communication nodes identified for disruption`,
        humint: `Comprehensive behavioral profile complete - evidence quality ${avgImpact}%. Predictive movement patterns established`,
    };
    return insights[path];
}

/**
 * Investigate an entity along a specific path
 */
export function investigatePath(
    entity: Entity,
    path: InvestigationPath,
    existingBranches?: InvestigationBranch[]
): {
    branches: InvestigationBranch[];
    newEvidence: Evidence[];
    newInsights: string[];
    unlockedConnections: boolean;
} {
    // Initialize branches if not present
    const branches = existingBranches || initializeInvestigationBranches();
    const targetBranch = branches.find(b => b.path === path);

    if (!targetBranch) {
        throw new Error(`Investigation path ${path} not found`);
    }

    // Unlock the path if not already unlocked
    targetBranch.unlocked = true;

    // Increase investigation level
    const oldLevel = targetBranch.level;
    const newLevel = Math.min(oldLevel + 1, 3);
    targetBranch.level = newLevel;

    // Generate new evidence for this level
    const seed = entity.id * 1000 + Date.now();
    const evidenceCount = newLevel; // More evidence at higher levels
    const newEvidence: Evidence[] = [];

    for (let i = 0; i < evidenceCount; i++) {
        const evidence = generateEvidence(entity, path, newLevel, seed + i);
        targetBranch.evidence.push(evidence);
        newEvidence.push(evidence);
    }

    // Generate insights based on new level
    const allInsights = generateInsights(entity, path, newLevel, targetBranch.evidence);
    const newInsights = allInsights.slice(oldLevel); // Only new insights
    targetBranch.insights = allInsights;

    // Level 2+ investigations unlock hidden connections
    const unlockedConnections = newLevel >= 2;

    return {
        branches,
        newEvidence,
        newInsights,
        unlockedConnections,
    };
}

/**
 * Calculate total evidence quality for an entity
 */
export function calculateEvidenceQuality(branches: InvestigationBranch[]): number {
    let totalImpact = 0;
    let evidenceCount = 0;

    branches.forEach(branch => {
        branch.evidence.forEach(evidence => {
            totalImpact += evidence.impact;
            evidenceCount++;
        });
    });

    return evidenceCount > 0 ? Math.floor(totalImpact / evidenceCount) : 0;
}

/**
 * Get the highest investigation level across all paths
 */
export function getMaxInvestigationLevel(branches?: InvestigationBranch[]): number {
    if (!branches) return 0;
    return Math.max(...branches.map(b => b.level));
}

/**
 * Check if investigation reveals new connections
 */
export function shouldRevealConnections(
    entity: Entity,
    connections: Connection[],
    branches?: InvestigationBranch[]
): number[] {
    if (!branches) return [];

    const maxLevel = getMaxInvestigationLevel(branches);
    if (maxLevel < 2) return [];

    // At level 2+, reveal connections based on investigation path
    const revealedEntityIds: Set<number> = new Set();

    connections.forEach(conn => {
        if (conn.from === entity.id || conn.to === entity.id) {
            const otherId = conn.from === entity.id ? conn.to : conn.from;

            // Financial path reveals financial/company entities
            const financialBranch = branches.find(b => b.path === 'financial');
            if (financialBranch && financialBranch.level >= 2 &&
                (conn.type.includes('financial') || conn.type.includes('transaction'))) {
                revealedEntityIds.add(otherId);
            }

            // Cyber path reveals cyber/comms entities
            const cyberBranch = branches.find(b => b.path === 'cyber');
            if (cyberBranch && cyberBranch.level >= 2 &&
                (conn.type.includes('cyber') || conn.type.includes('communication'))) {
                revealedEntityIds.add(otherId);
            }

            // HUMINT path reveals personal relationships
            const humintBranch = branches.find(b => b.path === 'humint');
            if (humintBranch && humintBranch.level >= 2 &&
                (conn.type.includes('personal') || conn.type.includes('associate'))) {
                revealedEntityIds.add(otherId);
            }
        }
    });

    return Array.from(revealedEntityIds);
}

/**
 * Calculate threat reduction from investigation quality
 */
export function calculateThreatReduction(branches?: InvestigationBranch[]): number {
    if (!branches) return 0;

    const maxLevel = getMaxInvestigationLevel(branches);
    const evidenceQuality = calculateEvidenceQuality(branches);

    // Base reduction from investigation level
    let reduction = maxLevel * 10; // 10%, 20%, 30% for levels 1, 2, 3

    // Bonus reduction from evidence quality
    if (evidenceQuality >= 80) {
        reduction += 10;
    } else if (evidenceQuality >= 60) {
        reduction += 5;
    }

    return Math.min(reduction, 40); // Max 40% threat reduction
}
