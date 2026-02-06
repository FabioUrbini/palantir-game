'use client';

// components/ObjectivesPanel.tsx - Mission objectives display

import type { GameObjective } from '../data/ontology';

interface ObjectivesPanelProps {
    objectives: GameObjective[];
    onClose: () => void;
}

export default function ObjectivesPanel({ objectives, onClose }: ObjectivesPanelProps) {
    const activeObjectives = objectives.filter(obj => obj.status === 'active');
    const completedObjectives = objectives.filter(obj => obj.status === 'completed');
    const failedObjectives = objectives.filter(obj => obj.status === 'failed');

    const getObjectiveTypeColor = (type: GameObjective['type']) => {
        switch (type) {
            case 'prevent': return '#ff2d55'; // critical red
            case 'investigate': return '#00e5ff'; // cyber cyan
            case 'resolve': return '#ffcc00'; // warning yellow
            case 'maintain': return '#30d158'; // safe green
        }
    };

    const getStatusIcon = (status: GameObjective['status']) => {
        switch (status) {
            case 'active': return '⏳';
            case 'completed': return '✅';
            case 'failed': return '❌';
        }
    };

    return (
        <div className="fixed inset-0 z-40 flex items-start justify-end p-4 pointer-events-none">
            <div className="w-80 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg shadow-2xl pointer-events-auto mt-16">
                {/* Header */}
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div>
                        <span className="data-label">MISSION OBJECTIVES</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-[9px] text-[var(--text-secondary)]">
                                {activeObjectives.length} Active
                            </span>
                            <span className="font-mono text-[9px] text-accent">
                                {completedObjectives.length} Complete
                            </span>
                            {failedObjectives.length > 0 && (
                                <span className="font-mono text-[9px] text-[var(--threat-critical)]">
                                    {failedObjectives.length} Failed
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-6 h-6 flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-y-auto p-3 space-y-3">
                    {/* Active Objectives */}
                    {activeObjectives.map(obj => (
                        <div
                            key={obj.id}
                            className="p-3 rounded border border-[var(--border)] bg-[var(--bg-card)] hover:border-accent/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                                        style={{
                                            backgroundColor: `${getObjectiveTypeColor(obj.type)}20`,
                                            color: getObjectiveTypeColor(obj.type),
                                        }}
                                    >
                                        {obj.type.toUpperCase()}
                                    </span>
                                    <span className="text-xs">{getStatusIcon(obj.status)}</span>
                                </div>
                                <span className="font-mono text-[10px] text-accent">
                                    {obj.progress}%
                                </span>
                            </div>

                            <h3 className="font-mono text-[10px] font-bold text-white mb-1">
                                {obj.title}
                            </h3>

                            <p className="font-sans text-[9px] text-[var(--text-secondary)] mb-2 leading-relaxed">
                                {obj.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-accent transition-all duration-500"
                                    style={{ width: `${obj.progress}%` }}
                                />
                            </div>

                            {/* Rewards */}
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[7px] text-[var(--text-secondary)]">
                                    REWARDS:
                                </span>
                                {obj.reward.budget && (
                                    <span className="font-mono text-[8px] text-yellow-400">
                                        +${obj.reward.budget.toLocaleString()}
                                    </span>
                                )}
                                {obj.reward.influence && (
                                    <span className="font-mono text-[8px] text-purple-400">
                                        +{obj.reward.influence} INF
                                    </span>
                                )}
                            </div>

                            {/* Time Limit */}
                            {obj.target.timeLimit && (
                                <div className="mt-2 font-mono text-[7px] text-orange-400">
                                    ⏱️ {obj.target.timeLimit} MIN DEADLINE
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Completed Objectives */}
                    {completedObjectives.length > 0 && (
                        <div className="pt-3 border-t border-[var(--border)]">
                            <span className="data-label mb-2 block">COMPLETED</span>
                            {completedObjectives.map(obj => (
                                <div
                                    key={obj.id}
                                    className="p-2 rounded border border-green-500/30 bg-green-500/10 mb-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[9px] text-white">
                                            ✅ {obj.title}
                                        </span>
                                        <span className="font-mono text-[8px] text-green-400">
                                            100%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Failed Objectives */}
                    {failedObjectives.length > 0 && (
                        <div className="pt-3 border-t border-[var(--border)]">
                            <span className="data-label mb-2 block text-red-400">FAILED</span>
                            {failedObjectives.map(obj => (
                                <div
                                    key={obj.id}
                                    className="p-2 rounded border border-red-500/30 bg-red-500/10 mb-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-[9px] text-white">
                                            ❌ {obj.title}
                                        </span>
                                        <span className="font-mono text-[8px] text-red-400">
                                            FAILED
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {objectives.length === 0 && (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                            <p className="font-mono text-[9px]">No objectives available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-primary)]">
                    <button
                        onClick={onClose}
                        className="w-full font-mono text-[8px] tracking-[2px] text-[var(--text-secondary)] hover:text-accent transition-colors"
                    >
                        CLOSE [ESC]
                    </button>
                </div>
            </div>
        </div>
    );
}
