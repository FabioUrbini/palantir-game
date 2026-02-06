'use client';

// hooks/useSimulation.ts - Master hook with consequences and objectives

import { useState, useEffect, useCallback } from 'react';
import { getSimulationState } from '../engine/generator';
import { updateSourceCounters } from '../engine/sources';
import { applyInvestigationConsequences, applyAlertResponseConsequences } from '../engine/consequences';
import { updateObjectiveProgress, applyObjectiveRewards } from '../engine/objectives';
import { loadPlayerState, savePlayerState, type PersistedState } from './usePersistence';
import { useToast } from './useToast';
import type { SimulationState, Entity, TimelineEvent } from '../data/ontology';

export interface UseSimulationReturn {
    state: SimulationState;
    selectedEntity: Entity | null;
    selectEntity: (id: number | null) => void;
    enabledSources: Set<string>;
    toggleSource: (sourceId: string) => void;
    activeView: 'graph' | 'map' | 'analytics' | 'timeline' | 'query';
    setActiveView: (view: 'graph' | 'map' | 'analytics' | 'timeline' | 'query') => void;
    timeSpeed: number;
    setTimeSpeed: (speed: number) => void;
    handleEntityAction: (entityId: number, action: string) => void;
    handleAlertResponse: (eventId: number, optionId: string) => void;
    activeAlert: TimelineEvent | null;
    dismissAlert: () => void;
    dismissedAlerts: Set<number>;
    reviewAlert: (event: TimelineEvent) => void;
}

/**
 * Master hook that drives the entire simulation dashboard
 * - Ticks every second for counter animations
 * - Regenerates full state every 30 seconds
 * - Manages entity selection and source filtering
 * - Handles player actions and resource management
 * - Regenerates resources over time
 * - Applies action consequences
 * - Tracks objective progress
 */
export function useSimulation(): UseSimulationReturn {
    const { showToast } = useToast();
    const [state, setState] = useState<SimulationState>(() => {
        const generatedState = getSimulationState();
        const savedState = loadPlayerState();

        if (!savedState) {
            return generatedState;
        }

        // Merge saved player data with fresh procedural generation
        const mergedEntities = generatedState.entities.map(entity => {
            const savedEntity = savedState.entityStates[entity.id];
            if (savedEntity) {
                return {
                    ...entity,
                    investigationLevel: savedEntity.investigationLevel,
                    playerFlags: savedEntity.flags,
                };
            }
            return entity;
        });

        const mergedObjectives = generatedState.objectives.map(obj => {
            const savedStatus = savedState.objectiveStates[obj.id];
            if (savedStatus) {
                return { ...obj, status: savedStatus };
            }
            return obj;
        });

        return {
            ...generatedState,
            entities: mergedEntities,
            objectives: mergedObjectives,
            playerResources: {
                ...generatedState.playerResources,
                ...savedState.playerResources,
            },
        };
    });
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [enabledSources, setEnabledSources] = useState<Set<string>>(
        () => new Set(['SIGINT', 'FININT', 'OSINT', 'HUMINT', 'GEOINT', 'CYBER', 'SATCOM', 'SOCMED'])
    );
    const [activeView, setActiveView] = useState<'graph' | 'map' | 'analytics' | 'timeline' | 'query'>('graph');
    const [timeSpeed, setTimeSpeed] = useState<number>(1);
    const [activeAlert, setActiveAlert] = useState<TimelineEvent | null>(null);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(() => {
        const savedState = loadPlayerState();
        return savedState ? new Set(savedState.dismissedAlerts) : new Set();
    });

    useEffect(() => {
        // Tick every second for counter animations (faster at higher speeds)
        const fastInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                tick: Date.now(),
                sources: updateSourceCounters(prev.sources, timeSpeed),
            }));
        }, 1000);

        // Tick for full state regeneration (more frequently at higher speeds)
        const slowInterval = setInterval(() => {
            setState(getSimulationState(timeSpeed));
        }, Math.max(1000, 30000 / timeSpeed));

        return () => {
            clearInterval(fastInterval);
            clearInterval(slowInterval);
        };
    }, [timeSpeed]);

    // Resource regeneration system
    useEffect(() => {
        const regenInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                playerResources: {
                    ...prev.playerResources,
                    budget: Math.min(
                        prev.playerResources.budget + 100,
                        prev.playerResources.maxBudget
                    ),
                }
            }));
        }, 60000); // Every minute

        const agentInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                playerResources: {
                    ...prev.playerResources,
                    agents: Math.min(
                        prev.playerResources.agents + 1,
                        prev.playerResources.maxAgents
                    ),
                }
            }));
        }, 300000); // 5 minutes

        const creditInterval = setInterval(() => {
            setState(prev => ({
                ...prev,
                playerResources: {
                    ...prev.playerResources,
                    dataCredits: Math.min(
                        prev.playerResources.dataCredits + 1,
                        20
                    ),
                }
            }));
        }, 120000); // 2 minutes

        return () => {
            clearInterval(regenInterval);
            clearInterval(agentInterval);
            clearInterval(creditInterval);
        };
    }, []);

    // Objective progress tracking
    useEffect(() => {
        const objectiveInterval = setInterval(() => {
            setState(prev => {
                const updatedObjectives = updateObjectiveProgress(
                    prev.objectives,
                    prev.entities,
                    prev.playerResources
                );

                // Check for newly completed objectives and apply rewards
                let updatedResources = { ...prev.playerResources };
                updatedObjectives.forEach((obj, idx) => {
                    const oldObj = prev.objectives[idx];
                    if (oldObj?.status === 'active' && obj.status === 'completed') {
                        updatedResources = applyObjectiveRewards(obj, updatedResources);
                        const rewardText = [
                            obj.reward.budget ? `+$${obj.reward.budget}` : '',
                            obj.reward.influence ? `+${obj.reward.influence} influence` : ''
                        ].filter(Boolean).join(', ');
                        showToast({
                            type: 'success',
                            message: `Mission Complete: ${obj.title}! Rewards: ${rewardText}`,
                            duration: 6000
                        });
                    }
                });

                return {
                    ...prev,
                    objectives: updatedObjectives,
                    playerResources: updatedResources,
                };
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(objectiveInterval);
    }, [showToast]);

    // Auto-save player state every 10 seconds
    useEffect(() => {
        const saveInterval = setInterval(() => {
            const entityStates: PersistedState['entityStates'] = {};
            state.entities.forEach(e => {
                if (e.investigationLevel || e.playerFlags) {
                    entityStates[e.id] = {
                        investigationLevel: e.investigationLevel || 0,
                        flags: e.playerFlags || {
                            priority: false,
                            watchlist: false,
                            investigated: false,
                            resolved: false
                        }
                    };
                }
            });

            const objectiveStates: PersistedState['objectiveStates'] = {};
            state.objectives.forEach(o => {
                objectiveStates[o.id] = o.status;
            });

            savePlayerState({
                playerResources: {
                    budget: state.playerResources.budget,
                    agents: state.playerResources.agents,
                    dataCredits: state.playerResources.dataCredits,
                    influence: state.playerResources.influence
                },
                entityStates,
                dismissedAlerts: Array.from(dismissedAlerts),
                objectiveStates,
                savedAt: Date.now()
            });
        }, 10000); // Every 10 seconds

        return () => clearInterval(saveInterval);
    }, [state.entities, state.objectives, state.playerResources, dismissedAlerts]);

    // Periodic state persistence (every 15 seconds)
    useEffect(() => {
        const saveInterval = setInterval(() => {
            const entityStates: PersistedState['entityStates'] = {};
            state.entities.forEach(entity => {
                if (entity.playerFlags || entity.investigationLevel) {
                    entityStates[entity.id] = {
                        investigationLevel: entity.investigationLevel || 0,
                        flags: entity.playerFlags || {
                            priority: false,
                            watchlist: false,
                            investigated: false,
                            resolved: false,
                        },
                    };
                }
            });

            const objectiveStates: PersistedState['objectiveStates'] = {};
            state.objectives.forEach(obj => {
                objectiveStates[obj.id] = obj.status;
            });

            const persistedState: PersistedState = {
                playerResources: state.playerResources,
                entityStates,
                dismissedAlerts: Array.from(dismissedAlerts),
                objectiveStates,
                savedAt: Date.now(),
            };

            savePlayerState(persistedState);
        }, 15000); // Save every 15 seconds

        return () => clearInterval(saveInterval);
    }, [state.entities, state.objectives, state.playerResources, dismissedAlerts]);

    // Auto-trigger interactive alerts
    useEffect(() => {
        if (activeAlert) return;

        const interactiveEvents = state.events.filter(
            e => e.requiresResponse && !e.playerResponse && !dismissedAlerts.has(e.id)
        );

        if (interactiveEvents.length > 0) {
            const criticalEvent = interactiveEvents.find(e => e.severity === 'critical');
            setActiveAlert(criticalEvent || interactiveEvents[0]);
        }
    }, [state.events]);

    const selectEntity = useCallback((id: number | null) => {
        setSelectedEntityId(id);
    }, []);

    const toggleSource = useCallback((sourceId: string) => {
        setEnabledSources(prev => {
            const next = new Set(prev);
            if (next.has(sourceId)) {
                next.delete(sourceId);
            } else {
                next.add(sourceId);
            }
            return next;
        });
    }, []);

    const handleEntityAction = useCallback((entityId: number, action: string) => {
        setState(prev => {
            // Calculate resource costs
            let budgetCost = 0;
            let agentCost = 0;
            let dataCreditCost = 0;

            const targetEntity = prev.entities.find(e => e.id === entityId);
            if (!targetEntity) return prev;

            switch (action) {
                case 'investigate':
                    budgetCost = 100;
                    dataCreditCost = 1;
                    break;
                case 'watchlist':
                    const isOnWatchlist = targetEntity.playerFlags?.watchlist || false;
                    agentCost = isOnWatchlist ? -1 : 1;
                    break;
            }

            // Validate resources
            if (prev.playerResources.budget < budgetCost) return prev;
            if (prev.playerResources.agents < agentCost) return prev;
            if (prev.playerResources.dataCredits < dataCreditCost) return prev;

            let updatedConnections = prev.connections;
            let consequenceLog = null;

            const updatedEntities = prev.entities.map(entity => {
                if (entity.id !== entityId) return entity;

                const flags = entity.playerFlags || {
                    priority: false,
                    watchlist: false,
                    investigated: false,
                    resolved: false,
                };

                switch (action) {
                    case 'priority':
                        flags.priority = !flags.priority;
                        break;
                    case 'investigate':
                        flags.investigated = true;
                        entity.investigationLevel = (entity.investigationLevel || 0) + 1;
                        entity.investigationLevel = Math.min(entity.investigationLevel, 3);

                        // APPLY CONSEQUENCES for level 2 and 3
                        if (entity.investigationLevel >= 2) {
                            const consequences = applyInvestigationConsequences(
                                entity,
                                prev.entities,
                                prev.connections,
                                entity.investigationLevel
                            );
                            updatedConnections = consequences.connections;
                            entity = consequences.entity;
                            consequenceLog = consequences.log;
                        }
                        break;
                    case 'watchlist':
                        flags.watchlist = !flags.watchlist;
                        break;
                    case 'resolve':
                        flags.resolved = !flags.resolved;
                        break;
                }

                entity.playerFlags = flags;
                entity.lastActionTime = Date.now();

                return entity;
            });

            const updatedResources = {
                ...prev.playerResources,
                budget: prev.playerResources.budget - budgetCost,
                agents: prev.playerResources.agents - agentCost,
                dataCredits: prev.playerResources.dataCredits - dataCreditCost,
            };

            const updatedLogs = consequenceLog
                ? [...prev.consequenceLogs, consequenceLog]
                : prev.consequenceLogs;

            return {
                ...prev,
                entities: updatedEntities,
                connections: updatedConnections,
                playerResources: updatedResources,
                consequenceLogs: updatedLogs,
            };
        });
    }, []);

    const handleAlertResponse = useCallback((eventId: number, optionId: string) => {
        setState(prev => {
            const event = prev.events.find(e => e.id === eventId);
            if (!event) return prev;

            const option = event.responseOptions?.find(o => o.id === optionId);
            if (!option) return prev;

            // Validate resources
            const budgetCost = option.cost.budget || 0;
            const agentCost = option.cost.agents || 0;
            const dataCreditCost = option.cost.dataCredits || 0;

            if (prev.playerResources.budget < budgetCost) return prev;
            if (prev.playerResources.agents < agentCost) return prev;
            if (prev.playerResources.dataCredits < dataCreditCost) return prev;

            // APPLY CONSEQUENCES
            const consequences = applyAlertResponseConsequences(
                event,
                optionId,
                prev.entities
            );

            const updatedEvents = prev.events.map(e => {
                if (e.id === eventId) {
                    return { ...e, playerResponse: optionId };
                }
                return e;
            });

            const updatedResources = {
                ...prev.playerResources,
                budget: prev.playerResources.budget - budgetCost,
                agents: prev.playerResources.agents - agentCost,
                dataCredits: prev.playerResources.dataCredits - dataCreditCost,
            };

            const updatedLogs = consequences.log
                ? [...prev.consequenceLogs, consequences.log]
                : prev.consequenceLogs;

            return {
                ...prev,
                entities: consequences.entities,
                events: updatedEvents,
                playerResources: updatedResources,
                consequenceLogs: updatedLogs,
            };
        });

        setActiveAlert(null);
    }, []);

    const dismissAlert = useCallback(() => {
        if (activeAlert) {
            setDismissedAlerts(prev => {
                const next = new Set(prev);
                next.add(activeAlert.id);
                return next;
            });
        }
        setActiveAlert(null);
    }, [activeAlert]);

    const reviewAlert = useCallback((event: TimelineEvent) => {
        setDismissedAlerts(prev => {
            const next = new Set(prev);
            next.delete(event.id);
            return next;
        });
        setActiveAlert(event);
    }, []);

    const selectedEntity = selectedEntityId !== null
        ? state.entities.find(e => e.id === selectedEntityId) || null
        : null;

    return {
        state,
        selectedEntity,
        selectEntity,
        enabledSources,
        toggleSource,
        activeView,
        setActiveView,
        timeSpeed,
        setTimeSpeed,
        handleEntityAction,
        handleAlertResponse,
        activeAlert,
        dismissAlert,
        dismissedAlerts,
        reviewAlert,
    };
}
