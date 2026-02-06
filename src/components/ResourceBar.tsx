'use client';

// components/ResourceBar.tsx - Display player resources

import type { PlayerResources } from '../data/ontology';

interface ResourceBarProps {
    resources: PlayerResources;
}

export default function ResourceBar({ resources }: ResourceBarProps) {
    const getColor = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage > 60) return '#30d158'; // green
        if (percentage > 30) return '#ffd60a'; // yellow
        return '#ff453a'; // red
    };

    const budgetColor = getColor(resources.budget, resources.maxBudget);
    const agentsColor = getColor(resources.agents, resources.maxAgents);
    const creditsColor = resources.dataCredits > 5 ? '#30d158' : resources.dataCredits > 2 ? '#ffd60a' : '#ff453a';

    return (
        <div className="flex items-center gap-4">
            {/* Budget */}
            <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                    BUDGET:
                </span>
                <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all"
                            style={{
                                width: `${(resources.budget / resources.maxBudget) * 100}%`,
                                backgroundColor: budgetColor,
                            }}
                        />
                    </div>
                    <span
                        className="font-mono text-[9px] tabular-nums"
                        style={{ color: budgetColor }}
                    >
                        ${resources.budget.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="w-px h-4 bg-[var(--border)]" />

            {/* Agents */}
            <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                    AGENTS:
                </span>
                <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className="h-full transition-all"
                            style={{
                                width: `${(resources.agents / resources.maxAgents) * 100}%`,
                                backgroundColor: agentsColor,
                            }}
                        />
                    </div>
                    <span
                        className="font-mono text-[9px] tabular-nums"
                        style={{ color: agentsColor }}
                    >
                        {resources.agents}/{resources.maxAgents}
                    </span>
                </div>
            </div>

            <div className="w-px h-4 bg-[var(--border)]" />

            {/* Data Credits */}
            <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                    DATA:
                </span>
                <span
                    className="font-mono text-[9px] tabular-nums"
                    style={{ color: creditsColor }}
                >
                    {resources.dataCredits} credits
                </span>
            </div>

            <div className="w-px h-4 bg-[var(--border)]" />

            {/* Influence */}
            <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] tracking-[1px] text-[var(--text-secondary)]">
                    INFLUENCE:
                </span>
                <span className="font-mono text-[9px] text-accent tabular-nums">
                    {resources.influence}
                </span>
            </div>
        </div>
    );
}
