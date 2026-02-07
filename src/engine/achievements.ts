// engine/achievements.ts - Achievement system and tracking

import type { Achievement, Entity, GameObjective, PlayerResources, TimelineEvent } from '../data/ontology';

/**
 * Define all available achievements
 */
export function getInitialAchievements(): Achievement[] {
    return [
        // Investigation achievements
        {
            id: 'first_investigation',
            title: 'First Steps',
            description: 'Complete your first entity investigation',
            icon: '🔍',
            category: 'investigation',
            tier: 'bronze',
            unlocked: false,
            points: 10,
        },
        {
            id: 'master_investigator',
            title: 'Master Investigator',
            description: 'Reach investigation level 3 on any entity',
            icon: '🕵️',
            category: 'investigation',
            tier: 'silver',
            unlocked: false,
            points: 25,
        },
        {
            id: 'deep_dive',
            title: 'Deep Dive',
            description: 'Investigate 10 different entities',
            icon: '📊',
            category: 'investigation',
            tier: 'gold',
            unlocked: false,
            progress: 0,
            maxProgress: 10,
            points: 50,
        },
        {
            id: 'thorough_analyst',
            title: 'Thorough Analyst',
            description: 'Reach max investigation level on 5 entities',
            icon: '🎯',
            category: 'investigation',
            tier: 'platinum',
            unlocked: false,
            progress: 0,
            maxProgress: 5,
            points: 100,
        },

        // Strategy achievements
        {
            id: 'first_alert',
            title: 'Rapid Response',
            description: 'Respond to your first critical alert',
            icon: '⚠️',
            category: 'strategy',
            tier: 'bronze',
            unlocked: false,
            points: 10,
        },
        {
            id: 'resource_manager',
            title: 'Resource Manager',
            description: 'Never let budget drop below 50%',
            icon: '💰',
            category: 'strategy',
            tier: 'silver',
            unlocked: false,
            points: 30,
        },
        {
            id: 'no_waste',
            title: 'Efficient Operator',
            description: 'Complete 5 objectives without wasting resources',
            icon: '⚡',
            category: 'strategy',
            tier: 'gold',
            unlocked: false,
            progress: 0,
            maxProgress: 5,
            points: 50,
        },
        {
            id: 'perfect_balance',
            title: 'Perfect Balance',
            description: 'Maintain all resources above 80% for 10 minutes',
            icon: '⚖️',
            category: 'strategy',
            tier: 'platinum',
            unlocked: false,
            points: 100,
        },

        // Speed achievements
        {
            id: 'quick_start',
            title: 'Quick Start',
            description: 'Complete first objective within 5 minutes',
            icon: '🚀',
            category: 'speed',
            tier: 'bronze',
            unlocked: false,
            points: 15,
        },
        {
            id: 'speed_runner',
            title: 'Speed Runner',
            description: 'Complete 3 objectives in under 15 minutes',
            icon: '⏱️',
            category: 'speed',
            tier: 'silver',
            unlocked: false,
            points: 40,
        },
        {
            id: 'lightning_fast',
            title: 'Lightning Fast',
            description: 'Respond to 5 alerts within 30 seconds each',
            icon: '⚡',
            category: 'speed',
            tier: 'gold',
            unlocked: false,
            progress: 0,
            maxProgress: 5,
            points: 60,
        },

        // Mastery achievements
        {
            id: 'first_objective',
            title: 'Mission Complete',
            description: 'Complete your first objective',
            icon: '✅',
            category: 'mastery',
            tier: 'bronze',
            unlocked: false,
            points: 15,
        },
        {
            id: 'objective_master',
            title: 'Objective Master',
            description: 'Complete all available objectives',
            icon: '🏆',
            category: 'mastery',
            tier: 'gold',
            unlocked: false,
            points: 75,
        },
        {
            id: 'perfect_operation',
            title: 'Perfect Operation',
            description: 'Complete all objectives without any failures',
            icon: '💎',
            category: 'mastery',
            tier: 'platinum',
            unlocked: false,
            points: 150,
        },
        {
            id: 'threat_eliminator',
            title: 'Threat Eliminator',
            description: 'Resolve 20 entities marked as threats',
            icon: '🛡️',
            category: 'mastery',
            tier: 'gold',
            unlocked: false,
            progress: 0,
            maxProgress: 20,
            points: 80,
        },

        // Special achievements
        {
            id: 'eagle_eye',
            title: 'Eagle Eye',
            description: 'Flag 10 entities as priority',
            icon: '👁️',
            category: 'special',
            tier: 'bronze',
            unlocked: false,
            progress: 0,
            maxProgress: 10,
            points: 20,
        },
        {
            id: 'network_analyst',
            title: 'Network Analyst',
            description: 'View all 5 analytical views',
            icon: '🌐',
            category: 'special',
            tier: 'bronze',
            unlocked: false,
            points: 10,
        },
        {
            id: 'data_hoarder',
            title: 'Data Hoarder',
            description: 'Enable all 8 data sources simultaneously',
            icon: '💾',
            category: 'special',
            tier: 'silver',
            unlocked: false,
            points: 25,
        },
        {
            id: 'persistence',
            title: 'Persistence Pays Off',
            description: 'Play for 30 consecutive minutes',
            icon: '⏳',
            category: 'special',
            tier: 'gold',
            unlocked: false,
            hidden: true,
            points: 50,
        },
        {
            id: 'completionist',
            title: 'Completionist',
            description: 'Unlock all other achievements',
            icon: '🌟',
            category: 'special',
            tier: 'platinum',
            unlocked: false,
            hidden: true,
            points: 200,
        },
    ];
}

/**
 * Check and update achievement progress based on game state
 */
export function checkAchievements(
    achievements: Achievement[],
    entities: Entity[],
    objectives: GameObjective[],
    events: TimelineEvent[],
    resources: PlayerResources,
    viewsVisited: Set<string>,
    enabledSources: Set<string>,
    sessionStartTime: number
): { achievements: Achievement[]; newlyUnlocked: Achievement[] } {
    const updatedAchievements = [...achievements];
    const newlyUnlocked: Achievement[] = [];

    // Helper to unlock achievement
    const unlock = (id: string) => {
        const achievement = updatedAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockedAt = Date.now();
            newlyUnlocked.push(achievement);
        }
    };

    // Helper to update progress
    const updateProgress = (id: string, current: number, max: number) => {
        const achievement = updatedAchievements.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            achievement.progress = current;
            achievement.maxProgress = max;
            if (current >= max) {
                unlock(id);
            }
        }
    };

    // Investigation achievements
    const investigatedEntities = entities.filter(e => e.investigationLevel && e.investigationLevel > 0);
    const level3Entities = entities.filter(e => e.investigationLevel === 3);

    if (investigatedEntities.length > 0) {
        unlock('first_investigation');
    }
    if (level3Entities.length > 0) {
        unlock('master_investigator');
    }
    updateProgress('deep_dive', investigatedEntities.length, 10);
    updateProgress('thorough_analyst', level3Entities.length, 5);

    // Strategy achievements
    const respondedAlerts = events.filter(e => e.requiresResponse && e.playerResponse);
    if (respondedAlerts.length > 0) {
        unlock('first_alert');
    }

    // Resource management check
    if (resources.budget >= resources.maxBudget * 0.5) {
        // This is a persistent check - would need more state tracking for full implementation
    }

    // Speed achievements - would need more timestamp tracking

    // Mastery achievements
    const completedObjectives = objectives.filter(o => o.status === 'completed');
    const failedObjectives = objectives.filter(o => o.status === 'failed');

    if (completedObjectives.length > 0) {
        unlock('first_objective');
    }
    if (completedObjectives.length === objectives.length && objectives.length > 0) {
        unlock('objective_master');
    }
    if (completedObjectives.length === objectives.length && failedObjectives.length === 0 && objectives.length > 0) {
        unlock('perfect_operation');
    }

    const resolvedEntities = entities.filter(e => e.playerFlags?.resolved);
    updateProgress('threat_eliminator', resolvedEntities.length, 20);

    // Special achievements
    const priorityEntities = entities.filter(e => e.playerFlags?.priority);
    updateProgress('eagle_eye', priorityEntities.length, 10);

    if (viewsVisited.size >= 5) {
        unlock('network_analyst');
    }

    if (enabledSources.size >= 8) {
        unlock('data_hoarder');
    }

    // Session time check
    const sessionDuration = Date.now() - sessionStartTime;
    if (sessionDuration >= 30 * 60 * 1000) { // 30 minutes
        unlock('persistence');
    }

    // Completionist check
    const unlockedCount = updatedAchievements.filter(a => a.unlocked && a.id !== 'completionist').length;
    const totalAchievements = updatedAchievements.filter(a => a.id !== 'completionist').length;
    if (unlockedCount === totalAchievements) {
        unlock('completionist');
    }

    return { achievements: updatedAchievements, newlyUnlocked };
}

/**
 * Calculate total score from achievements and game state
 */
export function calculateScore(
    achievements: Achievement[],
    objectives: GameObjective[],
    entities: Entity[],
    resources: PlayerResources
): number {
    let score = 0;

    // Achievement points
    achievements.forEach(achievement => {
        if (achievement.unlocked) {
            score += achievement.points;
        }
    });

    // Objective completion bonus
    const completedObjectives = objectives.filter(o => o.status === 'completed');
    score += completedObjectives.length * 100;

    // Investigation depth bonus
    entities.forEach(entity => {
        if (entity.investigationLevel) {
            score += entity.investigationLevel * 25;
        }
    });

    // Resource efficiency bonus
    const resourcePercentage = (
        (resources.budget / resources.maxBudget) +
        (resources.agents / resources.maxAgents) +
        (resources.dataCredits / 20)
    ) / 3;
    score += Math.floor(resourcePercentage * 100);

    return Math.floor(score);
}
