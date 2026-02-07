// data/ontology.ts - Type definitions for the Palantir simulation

export type InvestigationPath = 'financial' | 'cyber' | 'humint';

export interface Evidence {
    id: string;
    type: 'document' | 'recording' | 'transaction' | 'communication' | 'witness';
    title: string;
    description: string;
    quality: 'low' | 'medium' | 'high';
    discoveredAt: number;  // timestamp
    relatedPath: InvestigationPath;
    impact: number;  // 0-100, affects investigation success
}

export interface InvestigationBranch {
    path: InvestigationPath;
    level: number;  // 0-3
    evidence: Evidence[];
    unlocked: boolean;
    insights: string[];  // Discovered insights from this path
}

export interface Entity {
    id: number;
    name: string;
    type: 'person' | 'organization' | 'company' | 'location' |
    'financial' | 'cyber' | 'comms' | 'asset' | 'operation';
    threat: 'critical' | 'high' | 'medium' | 'low';
    risk: number;           // 0-100
    x: number;              // graph x position
    y: number;              // graph y position
    lat: number | null;     // map latitude
    lng: number | null;     // map longitude
    city: string;
    desc: string;
    sources: string[];
    spawnedAt?: number;     // hour index when this entity appeared
    // Player interaction fields
    playerFlags?: {
        priority: boolean;
        watchlist: boolean;
        investigated: boolean;
        resolved: boolean;
    };
    investigationLevel?: number;  // 0-3 (legacy, for backwards compatibility)
    lastActionTime?: number;      // timestamp
    // Multi-stage investigation fields
    investigationBranches?: InvestigationBranch[];
    totalEvidenceQuality?: number;  // Combined evidence quality score
}

export interface Connection {
    from: number;           // entity ID
    to: number;             // entity ID
    type: string;           // relationship label
    strength: number;       // 0.0 - 1.0
    evidence: number;       // supporting evidence count
}

export interface TimelineEvent {
    id: number;
    time: string;           // ISO 8601
    label: string;
    entity: number;         // related entity ID
    severity: 'critical' | 'high' | 'medium' | 'low';
    source: string;         // originating data source ID
    // Interactive alert fields
    requiresResponse?: boolean;
    responseOptions?: ResponseOption[];
    responseDeadline?: string;  // ISO 8601
    playerResponse?: string;    // selected option id
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;           // emoji icon
    category: 'investigation' | 'strategy' | 'speed' | 'mastery' | 'special';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    unlocked: boolean;
    unlockedAt?: number;    // timestamp
    progress?: number;      // 0-100 for progressive achievements
    maxProgress?: number;   // total needed
    hidden?: boolean;       // hidden until unlocked
    points: number;         // achievement points
}

export interface ResponseOption {
    id: string;
    label: string;
    cost: { budget?: number; agents?: number; dataCredits?: number };
    effect: string;  // description of consequence
}

export interface DataSource {
    id: string;
    name: string;
    type: string;
    status: 'active' | 'degraded';
    records: number;
    rate: number;           // records per second
    confidence: number;     // 0.0 - 1.0
}

export interface Alert {
    id: number;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    time: string;
    entityId: number;
}

export interface Phase {
    name: string;
    description: string;
    day: number;
    alertLevel: string;
}

export interface PlayerResources {
    budget: number;
    maxBudget: number;
    agents: number;
    maxAgents: number;
    dataCredits: number;
    influence: number;
}

export interface SimulationState {
    entities: Entity[];
    connections: Connection[];
    events: TimelineEvent[];
    alerts: Alert[];
    sources: DataSource[];
    phase: Phase;
    elapsedMinutes: number;
    elapsedHours: number;
    elapsedDays: number;
    tick: number;
    playerResources: PlayerResources;
    objectives: GameObjective[];
    consequenceLogs: ConsequenceLog[];
    achievements: Achievement[];
    totalScore: number;
}

export interface GameObjective {
    id: string;
    title: string;
    description: string;
    type: 'prevent' | 'investigate' | 'resolve' | 'maintain';
    target: {
        entityId?: number;
        threatLevel?: 'critical' | 'high';
        count?: number;
        timeLimit?: number;
    };
    reward: {
        influence?: number;
        budget?: number;
    };
    status: 'active' | 'completed' | 'failed';
    progress?: number;
}

export interface ConsequenceLog {
    id: string;
    time: number;
    type: 'investigation' | 'alert_response' | 'objective';
    message: string;
    entityId?: number;
}

