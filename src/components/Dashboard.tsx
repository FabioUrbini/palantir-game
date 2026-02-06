'use client';

// components/Dashboard.tsx - Master layout with objectives and consequences

import { useState } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import { isTutorialCompleted } from '../hooks/usePersistence';
import TopBar from './TopBar';
import AlertTicker from './AlertTicker';
import DataSourcePanel from './DataSourcePanel';
import EntityDetailPanel from './EntityDetailPanel';
import MiniTimeline from './MiniTimeline';
import InteractiveAlert from './InteractiveAlert';
import AlertHistory from './AlertHistory';
import ObjectivesPanel from './ObjectivesPanel';
import TutorialSystem from './TutorialSystem';
import GraphView from './views/GraphView';
import MapView from './views/MapView';
import AnalyticsView from './views/AnalyticsView';
import TimelineView from './views/TimelineView';
import QueryView from './views/QueryView';

export default function Dashboard() {
    const {
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
    } = useSimulation();

    const [showAlertHistory, setShowAlertHistory] = useState(false);
    const [showObjectives, setShowObjectives] = useState(false);
    const [showTutorial, setShowTutorial] = useState(!isTutorialCompleted());

    const showSidebars = activeView === 'graph' || activeView === 'map';

    // Count dismissed/responded alerts
    const alertHistoryCount = state.events.filter(e =>
        e.requiresResponse && (dismissedAlerts.has(e.id) || e.playerResponse)
    ).length;

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
            {/* Top Bar */}
            <TopBar
                phase={state.phase}
                activeView={activeView}
                onViewChange={setActiveView}
                timeSpeed={timeSpeed}
                onTimeSpeedChange={setTimeSpeed}
                resources={state.playerResources}
            />

            {/* Alert Ticker */}
            <AlertTicker
                alerts={state.alerts}
                onAlertClick={(alert) => {
                    // Find the full event for this alert
                    const event = state.events.find(e => e.entity === alert.entityId);
                    if (event?.requiresResponse && !event.playerResponse) {
                        // This will be handled by the activeAlert system
                    }
                }}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Data Sources */}
                {showSidebars && (
                    <DataSourcePanel
                        sources={state.sources}
                        enabledSources={enabledSources}
                        onToggle={toggleSource}
                    />
                )}

                {/* Main Viewport */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Views */}
                    {activeView === 'graph' && (
                        <GraphView
                            entities={state.entities}
                            connections={state.connections}
                            selectedEntityId={selectedEntity?.id || null}
                            enabledSources={enabledSources}
                            onEntitySelect={selectEntity}
                        />
                    )}

                    {activeView === 'map' && (
                        <MapView
                            entities={state.entities}
                            connections={state.connections}
                            selectedEntityId={selectedEntity?.id || null}
                            enabledSources={enabledSources}
                            onEntitySelect={selectEntity}
                        />
                    )}

                    {activeView === 'analytics' && (
                        <AnalyticsView
                            entities={state.entities}
                            events={state.events}
                            sources={state.sources}
                            elapsedMinutes={state.elapsedMinutes}
                            elapsedDays={state.elapsedDays}
                        />
                    )}

                    {activeView === 'timeline' && (
                        <TimelineView
                            events={state.events}
                            entities={state.entities}
                            selectedEntityId={selectedEntity?.id || null}
                            onEntitySelect={selectEntity}
                        />
                    )}

                    {activeView === 'query' && (
                        <QueryView
                            entities={state.entities}
                            onEntitySelect={selectEntity}
                        />
                    )}

                    {/* Mini Timeline (overlay for graph/map views) */}
                    {showSidebars && (
                        <MiniTimeline
                            events={state.events}
                            entities={state.entities}
                            selectedEntityId={selectedEntity?.id || null}
                            onEntitySelect={selectEntity}
                        />
                    )}

                    {/* Bottom-Right Buttons */}
                    <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
                        {/* Objectives Toggle Button */}
                        <button
                            onClick={() => setShowObjectives(!showObjectives)}
                            className="px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-accent transition-colors shadow-xl"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🎯</span>
                                <div className="text-left">
                                    <div className="font-mono text-[9px] tracking-[1px] text-white">
                                        OBJECTIVES
                                    </div>
                                    <div className="font-mono text-[7px] text-accent">
                                        {state.objectives.filter(o => o.status === 'active').length}/{state.objectives.length}
                                    </div>
                                </div>
                            </div>
                        </button>

                        {/* Alert History Toggle Button */}
                        <button
                            onClick={() => setShowAlertHistory(!showAlertHistory)}
                            className="px-4 py-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-accent transition-colors shadow-xl"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xl">📋</span>
                                <div className="text-left">
                                    <div className="font-mono text-[9px] tracking-[1px] text-white">
                                        ALERT HISTORY
                                    </div>
                                    {alertHistoryCount > 0 && (
                                        <div className="font-mono text-[7px] text-accent">
                                            {alertHistoryCount} items
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Right Sidebar - Entity Details */}
                {showSidebars && (
                    <EntityDetailPanel
                        entity={selectedEntity}
                        connections={state.connections}
                        events={state.events}
                        allEntities={state.entities}
                        resources={state.playerResources}
                        onClose={() => selectEntity(null)}
                        onAction={handleEntityAction}
                    />
                )}
            </div>

            {/* Interactive Alert Modal */}
            {activeAlert && (
                <InteractiveAlert
                    event={activeAlert}
                    resources={state.playerResources}
                    onRespond={handleAlertResponse}
                    onDismiss={dismissAlert}
                />
            )}

            {/* Objectives Panel */}
            {showObjectives && (
                <ObjectivesPanel
                    objectives={state.objectives}
                    onClose={() => setShowObjectives(false)}
                />
            )}

            {/* Alert History Panel */}
            {showAlertHistory && (
                <AlertHistory
                    events={state.events}
                    dismissedAlertIds={dismissedAlerts}
                    onClose={() => setShowAlertHistory(false)}
                    onReview={(event) => {
                        setShowAlertHistory(false);
                        reviewAlert(event);
                    }}
                />
            )}

            {/* Tutorial System */}
            {showTutorial && (
                <TutorialSystem onComplete={() => setShowTutorial(false)} />
            )}
        </div>
    );
}
