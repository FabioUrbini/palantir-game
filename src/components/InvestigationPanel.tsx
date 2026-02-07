'use client';

// components/InvestigationPanel.tsx - Multi-stage investigation interface

import { useState } from 'react';
import type { Entity, InvestigationBranch, InvestigationPath, Evidence } from '../data/ontology';
import { getPathInfo, calculateEvidenceQuality, getMaxInvestigationLevel } from '../engine/investigation';

interface InvestigationPanelProps {
    entity: Entity;
    onInvestigate: (path: InvestigationPath) => void;
    canAfford: boolean;
}

export default function InvestigationPanel({ entity, onInvestigate, canAfford }: InvestigationPanelProps) {
    const [selectedPath, setSelectedPath] = useState<InvestigationPath | null>(null);
    const branches = entity.investigationBranches || [];
    const evidenceQuality = calculateEvidenceQuality(branches);
    const maxLevel = getMaxInvestigationLevel(branches);

    // Cost increases with level
    const getCost = (level: number) => ({
        budget: 100 + (level * 100),
        credits: 1 + level,
    });

    const renderBranchCard = (branch: InvestigationBranch) => {
        const pathInfo = getPathInfo(branch.path);
        const nextLevel = Math.min(branch.level + 1, 3);
        const cost = getCost(branch.level);
        const isMaxLevel = branch.level >= 3;
        const isSelected = selectedPath === branch.path;

        return (
            <div
                key={branch.path}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                        ? 'border-accent bg-accent/10'
                        : branch.unlocked
                        ? 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-accent/50'
                        : 'border-[var(--border)] bg-[var(--bg-primary)] opacity-70'
                }`}
                onClick={() => setSelectedPath(isSelected ? null : branch.path)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{pathInfo.icon}</span>
                        <div>
                            <div className="font-mono text-xs text-white font-semibold">
                                {pathInfo.name}
                            </div>
                            <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                                {pathInfo.description}
                            </div>
                        </div>
                    </div>
                    {branch.unlocked && (
                        <div className="font-mono text-xs text-accent font-bold">
                            LEVEL {branch.level}/3
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all duration-500"
                            style={{ width: `${(branch.level / 3) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Evidence Count */}
                {branch.evidence.length > 0 && (
                    <div className="mb-2 font-mono text-[9px] text-[var(--text-secondary)]">
                        📁 {branch.evidence.length} evidence item(s) collected
                    </div>
                )}

                {/* Insights */}
                {branch.insights.length > 0 && isSelected && (
                    <div className="mb-3 space-y-1">
                        {branch.insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className="text-[9px] text-[var(--text-secondary)] pl-3 border-l-2 border-accent/30"
                            >
                                💡 {insight}
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                {!isMaxLevel && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onInvestigate(branch.path);
                        }}
                        disabled={!canAfford}
                        className={`w-full mt-2 px-3 py-2 rounded font-mono text-[9px] font-semibold transition-all ${
                            canAfford
                                ? 'bg-accent/20 text-accent hover:bg-accent/30 border border-accent/50'
                                : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)] cursor-not-allowed'
                        }`}
                    >
                        {branch.unlocked ? `DEEPEN TO LEVEL ${nextLevel}` : 'START INVESTIGATION'} (${cost.budget} + {cost.credits} credits)
                    </button>
                )}
                {isMaxLevel && (
                    <div className="w-full mt-2 px-3 py-2 rounded font-mono text-[9px] font-semibold text-center bg-accent/10 text-accent border border-accent/30">
                        ✓ INVESTIGATION COMPLETE
                    </div>
                )}
            </div>
        );
    };

    const renderEvidenceList = () => {
        const selectedBranch = branches.find(b => b.path === selectedPath);
        if (!selectedBranch || selectedBranch.evidence.length === 0) return null;

        return (
            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                <div className="font-mono text-xs text-white font-semibold mb-3">
                    📁 EVIDENCE COLLECTED
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedBranch.evidence.map((evidence) => (
                        <EvidenceCard key={evidence.id} evidence={evidence} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-white font-semibold">
                    🔬 MULTI-STAGE INVESTIGATION
                </div>
                {evidenceQuality > 0 && (
                    <div className="font-mono text-[9px] text-accent">
                        Evidence Quality: {evidenceQuality}%
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="text-[9px] text-[var(--text-secondary)] font-mono">
                Choose an investigation path to uncover evidence and insights. Each path reveals different aspects of the entity.
            </div>

            {/* Overall Progress */}
            {maxLevel > 0 && (
                <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                        <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                            Highest Investigation Level
                        </div>
                        <div className="font-mono text-xs text-accent font-bold">
                            LEVEL {maxLevel}/3
                        </div>
                    </div>
                </div>
            )}

            {/* Investigation Branches */}
            <div className="space-y-2">
                {branches.map(branch => renderBranchCard(branch))}
            </div>

            {/* Evidence List (for selected branch) */}
            {renderEvidenceList()}
        </div>
    );
}

function EvidenceCard({ evidence }: { evidence: Evidence }) {
    const qualityColor = {
        low: 'text-[var(--threat-low)]',
        medium: 'text-[var(--threat-medium)]',
        high: 'text-accent',
    };

    const qualityIcon = {
        low: '🔹',
        medium: '🔸',
        high: '💎',
    };

    const typeIcon = {
        document: '📄',
        recording: '🎙️',
        transaction: '💳',
        communication: '📧',
        witness: '👤',
    };

    return (
        <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                    <span className="text-base">{typeIcon[evidence.type]}</span>
                    <div className="flex-1">
                        <div className="font-mono text-[9px] text-white font-semibold">
                            {evidence.title}
                        </div>
                        <div className="font-mono text-[8px] text-[var(--text-secondary)] mt-1">
                            {evidence.description}
                        </div>
                    </div>
                </div>
                <div className={`font-mono text-[8px] font-semibold flex items-center gap-1 ${qualityColor[evidence.quality]}`}>
                    <span>{qualityIcon[evidence.quality]}</span>
                    <span>{evidence.quality.toUpperCase()}</span>
                </div>
            </div>
            <div className="mt-1 font-mono text-[8px] text-[var(--text-secondary)]">
                Impact: {evidence.impact}% • Discovered: {new Date(evidence.discoveredAt).toLocaleTimeString()}
            </div>
        </div>
    );
}
