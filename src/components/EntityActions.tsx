'use client';

// components/EntityActions.tsx - Interactive action buttons for entities

import type { Entity, PlayerResources } from '../data/ontology';
import { useState } from 'react';

interface EntityActionsProps {
    entity: Entity;
    resources: PlayerResources;
    onAction: (entityId: number, action: string) => void;
}

interface ActionButton {
    id: string;
    label: string;
    icon: string;
    cost: { budget?: number; agents?: number; dataCredits?: number };
    description: string;
    cooldown?: number; // seconds
}

const ACTIONS: ActionButton[] = [
    {
        id: 'priority',
        label: 'Flag Priority',
        icon: '⭐',
        cost: {},
        description: 'Mark as high-priority target',
    },
    {
        id: 'investigate',
        label: 'Request Intel',
        icon: '🔍',
        cost: { budget: 100, dataCredits: 1 },
        description: 'Launch deep investigation',
        cooldown: 300,
    },
    {
        id: 'watchlist',
        label: 'Add to Watchlist',
        icon: '👁️',
        cost: { agents: 1 },
        description: 'Monitor entity activity',
    },
    {
        id: 'resolve',
        label: 'Mark Resolved',
        icon: '✓',
        cost: {},
        description: 'Close investigation',
    },
];

export default function EntityActions({ entity, resources, onAction }: EntityActionsProps) {
    const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

    const canAfford = (cost: ActionButton['cost']) => {
        if (cost.budget && resources.budget < cost.budget) return false;
        if (cost.agents && resources.agents < cost.agents) return false;
        if (cost.dataCredits && resources.dataCredits < cost.dataCredits) return false;
        return true;
    };

    const isActionActive = (actionId: string) => {
        const flags = entity.playerFlags || { priority: false, watchlist: false, investigated: false, resolved: false };
        switch (actionId) {
            case 'priority': return flags.priority;
            case 'investigate': return flags.investigated;
            case 'watchlist': return flags.watchlist;
            case 'resolve': return flags.resolved;
            default: return false;
        }
    };

    const handleAction = (action: ActionButton) => {
        if (!canAfford(action.cost) || cooldowns[action.id]) return;

        onAction(entity.id, action.id);

        // Set cooldown if applicable
        if (action.cooldown) {
            setCooldowns(prev => ({ ...prev, [action.id]: action.cooldown! }));
            setTimeout(() => {
                setCooldowns(prev => {
                    const next = { ...prev };
                    delete next[action.id];
                    return next;
                });
            }, action.cooldown * 1000);
        }
    };

    return (
        <div className="p-4 border-b border-[var(--border)]">
            <span className="data-label mb-3 block">ACTIONS</span>

            <div className="grid grid-cols-2 gap-2">
                {ACTIONS.map(action => {
                    const affordable = canAfford(action.cost);
                    const active = isActionActive(action.id);
                    const onCooldown = !!cooldowns[action.id];
                    const disabled = !affordable || onCooldown;

                    return (
                        <button
                            key={action.id}
                            onClick={() => handleAction(action)}
                            disabled={disabled}
                            className={`
                                p-2 rounded border transition-all
                                ${active
                                    ? 'bg-accent/20 border-accent text-accent'
                                    : 'bg-[var(--bg-card)] border-[var(--border)] text-white hover:border-accent/50'
                                }
                                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            title={action.description}
                        >
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-sm">{action.icon}</span>
                                <span className="font-mono text-[8px] tracking-[0.5px] flex-1 text-left">
                                    {action.label}
                                </span>
                            </div>

                            {/* Cost display */}
                            {Object.keys(action.cost).length > 0 && (
                                <div className="font-mono text-[7px] text-[var(--text-secondary)]">
                                    {action.cost.budget && `$${action.cost.budget}`}
                                    {action.cost.agents && ` ${action.cost.agents}A`}
                                    {action.cost.dataCredits && ` ${action.cost.dataCredits}DC`}
                                </div>
                            )}

                            {/* Cooldown timer */}
                            {onCooldown && (
                                <div className="font-mono text-[7px] text-accent">
                                    {Math.ceil(cooldowns[action.id] / 60)}m
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Investigation level indicator */}
            {entity.investigationLevel !== undefined && entity.investigationLevel > 0 && (
                <div className="mt-3 p-2 rounded bg-[var(--bg-card)] border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[7px] tracking-[1px] text-[var(--text-secondary)]">
                            INVESTIGATION DEPTH
                        </span>
                        <span className="font-mono text-[9px] text-accent">
                            LVL {entity.investigationLevel}/3
                        </span>
                    </div>
                    <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent transition-all"
                            style={{ width: `${(entity.investigationLevel / 3) * 100}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
