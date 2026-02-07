// engine/relationships.ts - Dynamic relationship intelligence system

import type { Connection, ConnectionType, Entity } from '../data/ontology';

/**
 * Initialize connection metadata for a connection
 */
export function initializeConnectionMetadata(connection: Connection): Connection {
    if (connection.metadata) return connection;

    return {
        ...connection,
        baseStrength: connection.strength,
        connectionType: inferConnectionType(connection.type),
        metadata: {
            createdAt: Date.now(),
            lastActive: Date.now(),
            activityFrequency: 50 + Math.random() * 30, // Random initial activity
            disrupted: false,
            canReform: true,
            reformProgress: 0,
        },
    };
}

/**
 * Infer detailed connection type from legacy type string
 */
function inferConnectionType(typeString: string): ConnectionType {
    const lower = typeString.toLowerCase();

    if (lower.includes('financial') || lower.includes('transaction') || lower.includes('payment')) {
        return 'financial_transaction';
    }
    if (lower.includes('cyber') || lower.includes('digital') || lower.includes('communication') || lower.includes('email')) {
        return 'digital_communication';
    }
    if (lower.includes('business') || lower.includes('corporate') || lower.includes('partner')) {
        return 'business_partnership';
    }
    if (lower.includes('family') || lower.includes('relative') || lower.includes('spouse')) {
        return 'family_tie';
    }
    if (lower.includes('criminal') || lower.includes('associate') || lower.includes('gang')) {
        return 'criminal_association';
    }
    if (lower.includes('organization') || lower.includes('member')) {
        return 'organizational_link';
    }

    return 'personal_relationship';
}

/**
 * Get display info for connection type
 */
export function getConnectionTypeInfo(type: ConnectionType): {
    icon: string;
    color: string;
    displayName: string;
    description: string;
} {
    switch (type) {
        case 'financial_transaction':
            return {
                icon: '💰',
                color: '#FFD700',
                displayName: 'Financial',
                description: 'Money transfers, transactions, financial dealings',
            };
        case 'digital_communication':
            return {
                icon: '📧',
                color: '#00E5FF',
                displayName: 'Digital',
                description: 'Emails, messages, digital interactions',
            };
        case 'business_partnership':
            return {
                icon: '🤝',
                color: '#4CAF50',
                displayName: 'Business',
                description: 'Professional partnerships, corporate ties',
            };
        case 'family_tie':
            return {
                icon: '👨‍👩‍👧‍👦',
                color: '#FF6B9D',
                displayName: 'Family',
                description: 'Blood relations, marriage, family bonds',
            };
        case 'criminal_association':
            return {
                icon: '🚨',
                color: '#FF2D55',
                displayName: 'Criminal',
                description: 'Illegal activities, gang affiliation',
            };
        case 'personal_relationship':
            return {
                icon: '👤',
                color: '#9C27B0',
                displayName: 'Personal',
                description: 'Friends, acquaintances, social connections',
            };
        case 'organizational_link':
            return {
                icon: '🏢',
                color: '#2196F3',
                displayName: 'Organization',
                description: 'Company membership, institutional ties',
            };
    }
}

/**
 * Update connection strength based on time and activity
 */
export function updateConnectionStrength(
    connection: Connection,
    timeDelta: number = 30000, // 30 seconds default
    entities: Entity[]
): Connection {
    if (!connection.metadata || !connection.baseStrength) {
        return initializeConnectionMetadata(connection);
    }

    const metadata = connection.metadata;

    // If disrupted, check for reformation
    if (metadata.disrupted) {
        if (metadata.canReform) {
            const reformRate = 0.5; // Reform at 0.5% per update
            metadata.reformProgress = Math.min(100, (metadata.reformProgress || 0) + reformRate);

            if (metadata.reformProgress >= 100) {
                // Connection reforms
                metadata.disrupted = false;
                metadata.reformProgress = 0;
                metadata.lastActive = Date.now();
                connection.strength = connection.baseStrength * 0.3; // Reforms at 30% original strength
            } else {
                connection.strength = 0;
            }
        } else {
            connection.strength = 0;
        }
        return connection;
    }

    // Strengthen/weaken based on activity and type
    const activityImpact = metadata.activityFrequency / 100;
    const typeMultiplier = getConnectionTypeMultiplier(connection.connectionType!);

    // Family ties and business partnerships are more stable
    // Criminal associations and digital communications are more volatile
    const changeRate = typeMultiplier * (timeDelta / 30000) * 0.001; // 0.1% change per 30s

    // Activity frequency naturally decays slightly over time
    metadata.activityFrequency = Math.max(10, metadata.activityFrequency - 0.05);

    // Strength tends toward activity level
    const targetStrength = connection.baseStrength * activityImpact;
    if (connection.strength < targetStrength) {
        connection.strength = Math.min(targetStrength, connection.strength + changeRate);
    } else if (connection.strength > targetStrength) {
        connection.strength = Math.max(targetStrength, connection.strength - changeRate);
    }

    // Keep strength within bounds
    connection.strength = Math.max(0.1, Math.min(1.0, connection.strength));

    return connection;
}

/**
 * Get multiplier for how volatile a connection type is
 */
function getConnectionTypeMultiplier(type: ConnectionType): number {
    switch (type) {
        case 'family_tie':
            return 0.2; // Very stable
        case 'business_partnership':
            return 0.4; // Fairly stable
        case 'organizational_link':
            return 0.5; // Moderately stable
        case 'personal_relationship':
            return 0.8; // Somewhat volatile
        case 'financial_transaction':
            return 1.2; // Volatile
        case 'digital_communication':
            return 1.5; // Very volatile
        case 'criminal_association':
            return 1.8; // Extremely volatile
        default:
            return 1.0;
    }
}

/**
 * Disrupt a connection (player action)
 */
export function disruptConnection(
    connection: Connection,
    permanent: boolean = false
): Connection {
    if (!connection.metadata) {
        connection = initializeConnectionMetadata(connection);
    }

    connection.metadata!.disrupted = true;
    connection.metadata!.disruptedAt = Date.now();
    connection.metadata!.canReform = !permanent;
    connection.metadata!.reformProgress = 0;
    connection.strength = 0;

    return connection;
}

/**
 * Boost connection activity (from investigation actions)
 */
export function boostConnectionActivity(connection: Connection, amount: number = 20): Connection {
    if (!connection.metadata) {
        connection = initializeConnectionMetadata(connection);
    }

    connection.metadata!.activityFrequency = Math.min(100, connection.metadata!.activityFrequency + amount);
    connection.metadata!.lastActive = Date.now();

    return connection;
}

/**
 * Calculate network fragmentation score
 * Higher score = more fragmented network
 */
export function calculateNetworkFragmentation(connections: Connection[]): number {
    const totalConnections = connections.length;
    if (totalConnections === 0) return 0;

    const disruptedCount = connections.filter(c => c.metadata?.disrupted).length;
    const weakConnections = connections.filter(c => c.strength < 0.3).length;

    const fragmentationScore = ((disruptedCount + weakConnections * 0.5) / totalConnections) * 100;
    return Math.min(100, Math.round(fragmentationScore));
}

/**
 * Find key nodes in the network (entities with most connections)
 */
export function findKeyNodes(entities: Entity[], connections: Connection[], topN: number = 5): Entity[] {
    const connectionCounts = new Map<number, number>();

    connections.forEach(conn => {
        // Only count strong, non-disrupted connections
        if (conn.strength >= 0.5 && !conn.metadata?.disrupted) {
            connectionCounts.set(conn.from, (connectionCounts.get(conn.from) || 0) + 1);
            connectionCounts.set(conn.to, (connectionCounts.get(conn.to) || 0) + 1);
        }
    });

    // Sort entities by connection count
    const sortedEntities = entities
        .map(entity => ({
            entity,
            connections: connectionCounts.get(entity.id) || 0,
        }))
        .filter(item => item.connections > 0)
        .sort((a, b) => b.connections - a.connections)
        .slice(0, topN)
        .map(item => item.entity);

    return sortedEntities;
}

/**
 * Apply network effects when a key node is disrupted
 */
export function applyNetworkEffects(
    disruptedEntityId: number,
    entities: Entity[],
    connections: Connection[]
): {
    entities: Entity[];
    connections: Connection[];
    effects: string[];
} {
    const effects: string[] = [];

    // Find all connections to the disrupted entity
    const affectedConnections = connections.filter(
        c => (c.from === disruptedEntityId || c.to === disruptedEntityId) && !c.metadata?.disrupted
    );

    if (affectedConnections.length === 0) {
        return { entities, connections, effects };
    }

    effects.push(`${affectedConnections.length} connections affected by node disruption`);

    // Weaken connected entities' connections
    const affectedEntityIds = new Set<number>();
    affectedConnections.forEach(conn => {
        const otherId = conn.from === disruptedEntityId ? conn.to : conn.from;
        affectedEntityIds.add(otherId);
    });

    // Apply cascade effect - weaken connections of affected entities
    const updatedConnections = connections.map(conn => {
        // Direct connections to disrupted node
        if (conn.from === disruptedEntityId || conn.to === disruptedEntityId) {
            effects.push(`Connection disrupted: ${conn.type}`);
            return disruptConnection(conn, false);
        }

        // Secondary connections (one degree away)
        if (affectedEntityIds.has(conn.from) || affectedEntityIds.has(conn.to)) {
            const newConnection = { ...conn };
            newConnection.strength = Math.max(0.1, newConnection.strength * 0.7); // 30% reduction
            if (newConnection.metadata) {
                newConnection.metadata.activityFrequency *= 0.8; // 20% reduction
            }
            return newConnection;
        }

        return conn;
    });

    // Slightly increase threat for directly connected entities
    const updatedEntities = entities.map(entity => {
        if (affectedEntityIds.has(entity.id)) {
            const newEntity = { ...entity };
            newEntity.risk = Math.min(100, newEntity.risk + 5);
            return newEntity;
        }
        return entity;
    });

    effects.push(`${affectedEntityIds.size} entities' networks weakened`);

    return {
        entities: updatedEntities,
        connections: updatedConnections,
        effects,
    };
}

/**
 * Get connection health status
 */
export function getConnectionHealth(connection: Connection): {
    status: 'strong' | 'moderate' | 'weak' | 'disrupted';
    color: string;
} {
    if (connection.metadata?.disrupted) {
        return { status: 'disrupted', color: '#666666' };
    }

    if (connection.strength >= 0.7) {
        return { status: 'strong', color: '#4CAF50' };
    }
    if (connection.strength >= 0.4) {
        return { status: 'moderate', color: '#FF9500' };
    }
    return { status: 'weak', color: '#FF2D55' };
}

/**
 * Update all connections in the simulation (called periodically)
 */
export function updateAllConnections(
    connections: Connection[],
    entities: Entity[],
    timeDelta: number = 30000
): Connection[] {
    return connections.map(conn => {
        let updated = conn;

        // Initialize metadata if needed
        if (!updated.metadata) {
            updated = initializeConnectionMetadata(updated);
        }

        // Update strength based on time and activity
        updated = updateConnectionStrength(updated, timeDelta, entities);

        return updated;
    });
}
