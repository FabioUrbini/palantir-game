'use client';

// components/AchievementsPanel.tsx - Achievement browser and progress tracker

import type { Achievement } from '../data/ontology';
import { useState } from 'react';

interface AchievementsPanelProps {
    achievements: Achievement[];
    totalScore: number;
    onClose: () => void;
}

const TIER_COLORS = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
};

const TIER_BORDERS = {
    bronze: '2px solid #CD7F32',
    silver: '2px solid #C0C0C0',
    gold: '2px solid #FFD700',
    platinum: '2px solid #E5E4E2',
};

export default function AchievementsPanel({ achievements, totalScore, onClose }: AchievementsPanelProps) {
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.points, 0);

    const filteredAchievements = achievements.filter(achievement => {
        // Don't show hidden achievements if not unlocked
        if (achievement.hidden && !achievement.unlocked) return false;

        // Status filter
        if (filter === 'unlocked' && !achievement.unlocked) return false;
        if (filter === 'locked' && achievement.unlocked) return false;

        // Category filter
        if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false;

        return true;
    });

    const categories = ['all', 'investigation', 'strategy', 'speed', 'mastery', 'special'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-bg-secondary border-2 border-[var(--border)] rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col animate-scale-in">
                {/* Header */}
                <div className="p-6 border-b-2 border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">🏆</div>
                        <div>
                            <h2 className="font-mono text-[16px] font-bold text-white">ACHIEVEMENTS</h2>
                            <div className="font-mono text-[10px] text-[var(--text-secondary)]">
                                {unlockedCount} / {achievements.length} Unlocked • {totalPoints} Points
                            </div>
                        </div>
                    </div>

                    {/* Score Display */}
                    <div className="text-right">
                        <div className="font-mono text-[10px] text-[var(--text-secondary)]">TOTAL SCORE</div>
                        <div className="font-mono text-[24px] font-bold text-accent">{totalScore.toLocaleString()}</div>
                    </div>

                    <button
                        onClick={onClose}
                        className="ml-4 font-mono text-[10px] tracking-[1px] text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        CLOSE [ESC]
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-[var(--border)] flex items-center gap-4">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        {['all', 'unlocked', 'locked'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`
                                    px-3 py-1 rounded font-mono text-[9px] tracking-[1px] uppercase transition-all
                                    ${filter === f
                                        ? 'bg-accent/20 border border-accent text-accent'
                                        : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-accent'
                                    }
                                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="h-4 w-px bg-[var(--border)]" />

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`
                                    px-3 py-1 rounded font-mono text-[9px] tracking-[1px] uppercase transition-all
                                    ${categoryFilter === cat
                                        ? 'bg-accent/20 border border-accent text-accent'
                                        : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-accent'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Achievement Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAchievements.map(achievement => (
                            <div
                                key={achievement.id}
                                className={`
                                    p-4 rounded-lg border-2 transition-all
                                    ${achievement.unlocked
                                        ? 'bg-[var(--bg-card)] opacity-100'
                                        : 'bg-[var(--bg-card)] opacity-50'
                                    }
                                `}
                                style={{
                                    borderColor: achievement.unlocked
                                        ? TIER_COLORS[achievement.tier]
                                        : 'var(--border)',
                                }}
                            >
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        className="text-3xl flex-shrink-0"
                                        style={{
                                            filter: achievement.unlocked ? 'none' : 'grayscale(100%) brightness(0.5)',
                                        }}
                                    >
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-mono text-[12px] font-bold text-white mb-1">
                                            {achievement.title}
                                        </h3>
                                        <p className="font-body text-[10px] text-[var(--text-secondary)] leading-relaxed">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {/* Tier Badge */}
                                        <div
                                            className="px-2 py-1 rounded font-mono text-[7px] tracking-[1px] uppercase"
                                            style={{
                                                backgroundColor: `${TIER_COLORS[achievement.tier]}20`,
                                                color: TIER_COLORS[achievement.tier],
                                                border: `1px solid ${TIER_COLORS[achievement.tier]}`,
                                            }}
                                        >
                                            {achievement.tier}
                                        </div>

                                        {/* Points */}
                                        <div className="font-mono text-[9px] text-accent">
                                            +{achievement.points} pts
                                        </div>
                                    </div>

                                    {/* Progress or Unlock Time */}
                                    {achievement.unlocked ? (
                                        achievement.unlockedAt && (
                                            <div className="font-mono text-[7px] text-[var(--text-secondary)]">
                                                {new Date(achievement.unlockedAt).toLocaleDateString()}
                                            </div>
                                        )
                                    ) : achievement.maxProgress ? (
                                        <div className="flex items-center gap-2">
                                            <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                                                {achievement.progress}/{achievement.maxProgress}
                                            </div>
                                            <div className="w-24 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-accent transition-all"
                                                    style={{
                                                        width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                                            🔒 Locked
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAchievements.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">🎯</div>
                            <div className="font-mono text-[12px] text-[var(--text-secondary)]">
                                No achievements match your filters
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
