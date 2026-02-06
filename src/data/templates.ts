// data/templates.ts - Name pools, city pools, description templates

export const PERSON_NAMES = [
    'A. Volkov', 'V. Kessler', 'R. Hashemi', 'Dr. Li Wei', 'M. Okonkwo',
    'S. Petrov', 'J. Andersen', 'K. Nakamura', 'F. Alvarez', 'D. Mikhailov',
    'E. Osei', 'L. Brennan', 'H. Zhou', 'P. Dubois', 'C. Reyes',
    'T. Kovacs', 'N. Sato', 'B. Okafor', 'W. Lindqvist', 'G. Moretti',
];

export const COMPANY_NAMES = [
    'Meridian Corp', 'Shell Co. Alpha', 'NEXUS Bank AG', 'Obsidian Holdings',
    'Vortex Logistics', 'Crescent Trading', 'Iron Gate Capital', 'Phantom LLC',
    'Nordic Freight AS', 'Zenith Consulting', 'Black Ridge Ventures', 'Apex Maritime',
];

export const LOCATION_NAMES = [
    'Port Rashid Terminal', 'Warehouse 9, Odessa', 'Airstrip Kilo-7',
    'Dock 14, Piraeus', 'Compound Sigma', 'The Beirut Flat',
    'Zurich Safe House', 'Istanbul Transit Hub', 'Tangier Drop Point',
];

export const CYBER_NAMES = [
    'DarkNova Proxy', 'CyberVault Hosting', 'Phantom Relay Net',
    'Zero-Day Forge', 'Ghost Router Cluster', 'Black Horizon C2',
];

export const FINANCIAL_NAMES = [
    'Crypto Wallet 0x4fe2...', 'Numbered Account CH-8892', 'Hawala Network Delta',
    'Cyprus Holding Trust', 'Panama Registry 447', 'Singapore Fund VII',
];

export const COMMS_NAMES = [
    'Signal Group "Nightfall"', 'Encrypted Channel Alpha', 'Telegram Bot @ghost_relay',
    'Dark Web Forum "Agora"', 'Mesh Network Epsilon', 'Sat Phone Cluster 9',
];

export const CITIES = [
    { name: 'Vienna', lat: 48.2082, lng: 16.3738 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'Odessa', lat: 46.4825, lng: 30.7233 },
    { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784 },
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
    { name: 'Limassol', lat: 34.6937, lng: 33.0226 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Tehran', lat: 35.6892, lng: 51.3890 },
    { name: 'Piraeus', lat: 37.9475, lng: 23.6372 },
    { name: 'Tangier', lat: 35.7595, lng: -5.8340 },
    { name: 'Beirut', lat: 33.8938, lng: 35.5018 },
    { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

export const EVENT_TEMPLATES: Record<string, string[]> = {
    person: [
        '{entity} flagged at border checkpoint — biometric match confirmed',
        'Intercepted communication involving {entity} — analysis pending',
        '{entity} observed meeting unknown contact — HUMINT report filed',
        'Financial transaction linked to {entity} — €{amount} transferred',
        'Travel pattern anomaly detected for {entity}',
        '{entity} used known alias at hotel registration',
    ],
    company: [
        '{entity} received wire transfer of €{amount} from offshore account',
        'New corporate filing detected for {entity} — ownership change',
        '{entity} flagged in regulatory suspicious activity report',
        'Beneficial ownership of {entity} traced to shell structure',
    ],
    location: [
        'Surveillance detects unusual activity at {entity}',
        'Satellite imagery shows changes at {entity}',
        'HUMINT asset reports movement near {entity}',
        'Geofence alert triggered at {entity}',
    ],
    cyber: [
        '{entity} infrastructure expanded — {n} new nodes detected',
        'Traffic spike from {entity} — possible C2 communication',
        'DDoS signature from {entity} matched in new attack',
        '{entity} SSL certificates rotated — evasion tactic suspected',
    ],
    financial: [
        '${amount} moved through {entity} to unknown recipient',
        '{entity} linked to new mixing service — trace ongoing',
        'Pattern analysis flags {entity} for layering activity',
    ],
    default: [
        'New intelligence collected on {entity}',
        'Updated assessment for {entity} — risk score adjusted',
        'Cross-reference match found involving {entity}',
    ],
};

export const CONNECTION_TYPES: Record<string, string[]> = {
    'person-person': ['communicates', 'directs', 'associate', 'met_with', 'recruited'],
    'person-company': ['owns', 'manages', 'consultant', 'account_holder', 'employee'],
    'person-location': ['frequents', 'visited', 'resides', 'surveilled_at'],
    'person-financial': ['transacts', 'controls', 'beneficiary'],
    'person-cyber': ['operates', 'uses', 'administers'],
    'company-company': ['subsidiary', 'partner', 'competitor', 'shell_for'],
    'company-location': ['registered_at', 'operates_from', 'warehouse'],
    'company-financial': ['banking', 'transfers', 'invests_via'],
    'cyber-cyber': ['routes_through', 'mirrors', 'proxies'],
    'default': ['linked_to', 'associated', 'co-mentioned', 'flagged_with'],
};

export const DESCRIPTIONS: Record<string, string[]> = {
    person: [
        'Known associate of multiple organizations under investigation.',
        'Technical specialist with expertise in secure communications.',
        'Former military officer, now private sector consultant.',
        'Financial advisor with connections to offshore networks.',
        'Logistics coordinator for cross-border operations.',
    ],
    company: [
        'Shell company with opaque ownership structure.',
        'Logistics firm operating in grey-zone jurisdictions.',
        'Financial services provider flagged for due diligence.',
        'Technology company with government contracts.',
        'Trading firm active in sanctions-adjacent markets.',
    ],
    location: [
        'High-traffic transit point under surveillance.',
        'Known meeting location for persons of interest.',
        'Warehouse facility with irregular activity patterns.',
        'Residential property linked to network principals.',
        'Border crossing with documented smuggling history.',
    ],
    cyber: [
        'Command and control infrastructure detected.',
        'Proxy network used for anonymization.',
        'Hosting provider popular with criminal actors.',
        'Dark web forum for coordination.',
        'Encrypted communications platform.',
    ],
    financial: [
        'Cryptocurrency wallet with suspicious transaction patterns.',
        'Bank account used for layering activities.',
        'Hawala node in informal value transfer network.',
        'Investment vehicle with beneficial ownership concerns.',
        'Payment processor flagged for AML violations.',
    ],
    default: [
        'Entity under active intelligence collection.',
        'Subject of ongoing cross-agency investigation.',
        'Newly identified node in the network graph.',
    ],
};

export const SOURCE_DEFINITIONS = [
    { id: 'SIGINT', name: 'SIGINT', type: 'signals', color: '#00e5ff' },
    { id: 'FININT', name: 'FININT', type: 'financial', color: '#ffd700' },
    { id: 'OSINT', name: 'OSINT', type: 'open', color: '#7c4dff' },
    { id: 'HUMINT', name: 'HUMINT', type: 'human', color: '#ff6b6b' },
    { id: 'GEOINT', name: 'GEOINT', type: 'geospatial', color: '#00e676' },
    { id: 'CYBER', name: 'CYBER', type: 'cyber', color: '#ff4081' },
    { id: 'SATCOM', name: 'SATCOM', type: 'satellite', color: '#40c4ff' },
    { id: 'SOCMED', name: 'SOCMED', type: 'social', color: '#ce93d8' },
];
