// data/theme.ts - Color maps, icon maps, font config

export const ENTITY_ICONS: Record<string, string> = {
    organization: '◆',
    person: '●',
    company: '■',
    location: '▲',
    financial: '◎',
    cyber: '⬡',
    comms: '◈',
    asset: '◇',
    operation: '⊛',
};

export const THREAT_COLORS: Record<string, string> = {
    critical: '#ff2d55',
    high: '#ff9500',
    medium: '#ffcc00',
    low: '#30d158',
};

export const SOURCE_COLORS: Record<string, string> = {
    SIGINT: '#00e5ff',
    FININT: '#ffd700',
    OSINT: '#7c4dff',
    HUMINT: '#ff6b6b',
    GEOINT: '#00e676',
    CYBER: '#ff4081',
    SATCOM: '#40c4ff',
    SOCMED: '#ce93d8',
};

export const ENTITY_COLORS: Record<string, string> = {
    organization: '#00e5ff',
    person: '#7c4dff',
    company: '#ff9500',
    location: '#00e676',
    financial: '#ffd700',
    cyber: '#ff4081',
    comms: '#40c4ff',
    asset: '#ce93d8',
    operation: '#ff2d55',
};

export const SEVERITY_LABELS: Record<string, string> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
};
