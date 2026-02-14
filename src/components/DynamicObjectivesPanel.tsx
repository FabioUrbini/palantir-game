'use client';

// components/DynamicObjectivesPanel.tsx - Enhanced objectives panel with chains and hidden objectives

import { useState } from 'react';
import type { GameObjective } from '../data/ontology';
import type { ObjectiveChain, HiddenObjective } from '../engine/dynamicObjectives';

interface DynamicObjectivesPanelProps {
    objectives: GameObjective[];
    chains: ObjectiveChain[];
    hiddenObjectives: HiddenObjective[];
    onClose: () => void;
}

export default function DynamicObjectivesPanel({
    objectives,
    chains,
    hiddenObjectives,
    onClose,
}: DynamicObjectivesPanelProps) {
    const [activeTab, setActiveTab] = useState<'active' | 'chains' | 'hidden'>('active');

    const activeObjectives = objectives.filter(o => o.status === 'active' && !o.isChainObjective);
    const completedObjectives = objectives.filter(o => o.status === 'completed');
    const failedObjectives = objectives.filter(o => o.status === 'failed');
    const discoveredHidden = hiddenObjectives.filter(h => h.discovered);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-[800px] max-h-[80vh] bg-[var(--bg-primary)] border-2 border-accent rounded-lg shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-mono text-2xl font-bold text-white tracking-tight">
                            🎯 MISSION OBJECTIVES
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        <TabButton
                            active={activeTab === 'active'}
                            onClick={() => setActiveTab('active')}
                            label="Active"
                            count={activeObjectives.length}
                        />
                        <TabButton
                            active={activeTab === 'chains'}
                            onClick={() => setActiveTab('chains')}
                            label="Chains"
                            count={chains.filter(c => c.unlocked).length}
                        />
                        <TabButton
                            active={activeTab === 'hidden'}
                            onClick={() => setActiveTab('hidden')}
                            label="Hidden"
                            count={discoveredHidden.length}
                            badge={discoveredHidden.length > 0}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'active' && (
                        <div className="space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <StatCard label="Active" value={activeObjectives.length} color="var(--accent)" />
                                <StatCard label="Completed" value={completedObjectives.length} color="var(--threat-low)" />
                                <StatCard label="Failed" value={failedObjectives.length} color="var(--threat-critical)" />
                            </div>

                            {/* Active Objectives */}
                            {activeObjectives.length > 0 ? (
                                <div className="space-y-3">
                                    {activeObjectives.map(obj => (
                                        <ObjectiveCard key={obj.id} objective={obj} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No active objectives. Complete current tasks or wait for new missions." />
                            )}

                            {/* Completed */}
                            {completedObjectives.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-mono text-sm text-[var(--text-secondary)] mb-3">
                                        ✅ COMPLETED
                                    </h3>
                                    <div className="space-y-2">
                                        {completedObjectives.map(obj => (
                                            <CompletedObjectiveCard key={obj.id} objective={obj} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed */}
                            {failedObjectives.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-mono text-sm text-[var(--text-secondary)] mb-3">
                                        ❌ FAILED
                                    </h3>
                                    <div className="space-y-2">
                                        {failedObjectives.map(obj => (
                                            <FailedObjectiveCard key={obj.id} objective={obj} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chains' && (
                        <div className="space-y-4">
                            {chains.filter(c => c.unlocked).map(chain => (
                                <ChainCard key={chain.id} chain={chain} />
                            ))}
                            {chains.filter(c => c.unlocked).length === 0 && (
                                <EmptyState message="No objective chains unlocked yet. Complete objectives to unlock chains." />
                            )}
                        </div>
                    )}

                    {activeTab === 'hidden' && (
                        <div className="space-y-4">
                            {discoveredHidden.length > 0 ? (
                                discoveredHidden.map(obj => (
                                    <HiddenObjectiveCard key={obj.id} objective={obj} />
                                ))
                            ) : (
                                <EmptyState message="No hidden objectives discovered yet. Keep playing to uncover secret missions!" icon="🔒" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabButton({
    active,
    onClick,
    label,
    count,
    badge,
}: {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    badge?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded font-mono text-xs font-semibold transition-all relative ${
                active
                    ? 'bg-accent text-black'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
            }`}
        >
            {label} ({count})
            {badge && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--threat-critical)] rounded-full animate-pulse" />
            )}
        </button>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="font-mono text-[9px] text-[var(--text-secondary)] mb-1">{label}</div>
            <div className="font-mono text-2xl font-bold" style={{ color }}>
                {value}
            </div>
        </div>
    );
}

function ObjectiveCard({ objective }: { objective: GameObjective }) {
    const typeColors = {
        prevent: 'var(--threat-critical)',
        investigate: 'var(--accent)',
        resolve: 'var(--threat-medium)',
        maintain: 'var(--threat-low)',
    };

    const typeColor = typeColors[objective.type];

    return (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-accent/50 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="font-mono text-[8px] px-2 py-1 rounded"
                            style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                        >
                            {objective.type.toUpperCase()}
                        </span>
                        {objective.isProcedural && (
                            <span className="font-mono text-[8px] px-2 py-1 rounded bg-accent/20 text-accent">
                                PROCEDURAL
                            </span>
                        )}
                    </div>
                    <h3 className="font-mono text-sm font-bold text-white">{objective.title}</h3>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
                        {objective.description}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">Progress</span>
                    <span className="font-mono text-[8px] font-bold text-accent">
                        {objective.progress || 0}%
                    </span>
                </div>
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent transition-all duration-500"
                        style={{ width: `${objective.progress || 0}%` }}
                    />
                </div>
            </div>

            {/* Rewards & Time Limit */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-mono text-[9px] text-[var(--text-secondary)]">
                    {objective.reward.influence && (
                        <span>⭐ +{objective.reward.influence} Influence</span>
                    )}
                    {objective.reward.budget && <span>💰 +${objective.reward.budget}</span>}
                </div>
                {objective.target.timeLimit && (
                    <span className="font-mono text-[9px] text-[var(--threat-medium)]">
                        ⏱️ {objective.target.timeLimit}min
                    </span>
                )}
            </div>
        </div>
    );
}

function CompletedObjectiveCard({ objective }: { objective: GameObjective }) {
    return (
        <div className="p-3 rounded-lg bg-[var(--threat-low)]/10 border border-[var(--threat-low)]/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--threat-low)]">✓</span>
                    <span className="font-mono text-[10px] text-white">{objective.title}</span>
                </div>
                <div className="font-mono text-[9px] text-[var(--threat-low)]">
                    +{objective.reward.influence || 0} ⭐
                </div>
            </div>
        </div>
    );
}

function FailedObjectiveCard({ objective }: { objective: GameObjective }) {
    return (
        <div className="p-3 rounded-lg bg-[var(--threat-critical)]/10 border border-[var(--threat-critical)]/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[var(--threat-critical)]">✗</span>
                    <span className="font-mono text-[10px] text-white line-through opacity-60">
                        {objective.title}
                    </span>
                </div>
                {objective.failureConsequence && (
                    <span className="font-mono text-[8px] text-[var(--threat-critical)]">
                        {objective.failureConsequence}
                    </span>
                )}
            </div>
        </div>
    );
}

function ChainCard({ chain }: { chain: ObjectiveChain }) {
    const currentObjective = chain.objectives[chain.currentStep];
    const progress = (chain.currentStep / chain.objectives.length) * 100;

    return (
        <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border-2 border-accent/50">
            {/* Chain Header */}
            <div className="mb-4">
                <h3 className="font-mono text-sm font-bold text-accent mb-1">⛓️ {chain.name}</h3>
                <p className="font-mono text-[9px] text-[var(--text-secondary)]">{chain.description}</p>
            </div>

            {/* Chain Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[8px] text-[var(--text-secondary)]">
                        Step {chain.currentStep + 1} of {chain.objectives.length}
                    </span>
                    <span className="font-mono text-[8px] font-bold text-accent">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Current Objective */}
            {currentObjective && (
                <div className="p-3 rounded bg-[var(--bg-primary)] border border-accent/30">
                    <div className="font-mono text-[10px] font-bold text-white mb-1">
                        {currentObjective.title}
                    </div>
                    <div className="font-mono text-[9px] text-[var(--text-secondary)]">
                        {currentObjective.description}
                    </div>
                    <div className="mt-2 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${currentObjective.progress || 0}%` }}
                        />
                    </div>
                </div>
            )}

            {/* All Steps */}
            <div className="mt-3 flex items-center gap-1">
                {chain.objectives.map((obj, idx) => (
                    <div
                        key={idx}
                        className={`flex-1 h-1 rounded-full ${
                            idx < chain.currentStep
                                ? 'bg-[var(--threat-low)]'
                                : idx === chain.currentStep
                                ? 'bg-accent'
                                : 'bg-[var(--border)]'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

function HiddenObjectiveCard({ objective }: { objective: HiddenObjective }) {
    return (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-2 border-purple-500/50">
            <div className="flex items-start gap-3">
                <span className="text-2xl">🔓</span>
                <div className="flex-1">
                    <h3 className="font-mono text-sm font-bold text-purple-300 mb-1">{objective.title}</h3>
                    <p className="font-mono text-[10px] text-[var(--text-secondary)] mb-3">
                        {objective.description}
                    </p>

                    {/* Progress */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-[8px] text-[var(--text-secondary)]">Progress</span>
                            <span className="font-mono text-[8px] font-bold text-purple-400">
                                {objective.progress || 0}%
                            </span>
                        </div>
                        <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${objective.progress || 0}%` }}
                            />
                        </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-3 font-mono text-[9px] text-purple-300">
                        {objective.reward.influence && <span>⭐ +{objective.reward.influence} Influence</span>}
                        {objective.reward.budget && <span>💰 +${objective.reward.budget}</span>}
                    </div>

                    {objective.status === 'completed' && (
                        <div className="mt-2 font-mono text-[8px] text-[var(--threat-low)]">
                            ✓ COMPLETED - Rewards claimed!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message, icon = '📋' }: { message: string; icon?: string }) {
    return (
        <div className="text-center py-12">
            <div className="text-4xl mb-3">{icon}</div>
            <p className="font-mono text-sm text-[var(--text-secondary)]">{message}</p>
        </div>
    );
}
