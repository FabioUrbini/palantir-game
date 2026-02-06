'use client';

// components/TutorialSystem.tsx - Interactive onboarding for first-time players

import { useState, useEffect } from 'react';
import { setTutorialCompleted } from '../hooks/usePersistence';

interface TutorialStep {
    id: string;
    title: string;
    content: string;
    highlight?: string; // CSS selector to highlight
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Operation Ghost Protocol',
        content: 'You are an intelligence analyst tasked with investigating a complex criminal network. Use your resources wisely to uncover connections and neutralize threats before they escalate.',
        position: 'center',
    },
    {
        id: 'resources',
        title: 'Resource Management',
        content: 'Monitor your resources in the top bar: **Budget** ($10,000), **Agents** (8/10), **Data Credits** (10), and **Influence** (50). Resources regenerate over time: Budget +$100/min, Agents +1/5min, Credits +1/2min.',
        position: 'top',
    },
    {
        id: 'entities',
        title: 'Entity Network',
        content: 'The graph shows intelligence entities. **Click any node** to select it and view details. Color indicates threat level: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low.',
        position: 'center',
    },
    {
        id: 'investigation',
        title: 'Investigation Actions',
        content: 'Select an entity to see available actions:\n\n• **Flag Priority** (Free) - Mark for tracking\n• **Request Intel** ($100 + 1 credit) - Deepen investigation\n• **Add to Watchlist** (1 agent) - Continuous monitoring\n• **Mark Resolved** (Free) - Close investigation\n\nInvestigating to **Level 2** reveals hidden connections. **Level 3** reduces threat by 30%!',
        position: 'right',
    },
    {
        id: 'alerts',
        title: 'Interactive Alerts',
        content: 'Time-sensitive alerts will appear every 2-3 minutes. Choose your response carefully:\n\n• **Investigate** - High cost, major threat reduction\n• **Monitor** - Medium cost, stabilizes threat\n• **Dismiss** - Free, but threat escalates!',
        position: 'center',
    },
    {
        id: 'objectives',
        title: 'Mission Objectives',
        content: 'Click the 🎯 button (bottom-right) to view your 4 active objectives. Complete them to earn rewards:\n\n• **PREVENT**: Investigate all critical entities (60 min)\n• **RESOLVE**: Mark 3 high threats as resolved\n• **MAINTAIN**: Keep budget above $5K (30 min)\n• **INVESTIGATE**: Reach level 3 on 2 entities',
        position: 'bottom',
    },
    {
        id: 'views',
        title: 'Multiple Views',
        content: 'Switch between 5 analytical views using the top navigation:\n\n• **GRAPH** - Network visualization\n• **MAP** - Geographic distribution\n• **ANALYTICS** - Charts and metrics\n• **TIMELINE** - Event chronology\n• **QUERY** - Entity search',
        position: 'top',
    },
    {
        id: 'ready',
        title: 'You\'re Ready!',
        content: 'The operation is live and evolving. New entities spawn, events trigger, and threats escalate in real-time. Your progress auto-saves every 15 seconds.\n\n**Good luck, Analyst.**',
        position: 'center',
    },
];

interface TutorialSystemProps {
    onComplete: () => void;
}

export default function TutorialSystem({ onComplete }: TutorialSystemProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            setTutorialCompleted(true);
            setIsVisible(false);
            onComplete();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleSkip = () => {
        setTutorialCompleted(true);
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible) return null;

    const positionClasses = {
        center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        top: 'top-24 left-1/2 -translate-x-1/2',
        bottom: 'bottom-24 left-1/2 -translate-x-1/2',
        left: 'top-1/2 left-24 -translate-y-1/2',
        right: 'top-1/2 right-24 -translate-y-1/2',
    };

    return (
        <>
            {/* Overlay backdrop */}
            <div className="fixed inset-0 bg-black/80 z-[9998] animate-fade-in" />

            {/* Tutorial modal */}
            <div
                className={`fixed z-[9999] w-[500px] max-w-[90vw] ${positionClasses[step.position || 'center']} animate-scale-in`}
            >
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-active)] rounded-lg shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[var(--accent)]/10 to-transparent p-4 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                                    <span className="text-[var(--accent)] font-mono text-sm font-bold">
                                        {currentStep + 1}
                                    </span>
                                </div>
                                <h2 className="text-[var(--text-primary)] font-mono text-sm font-semibold tracking-wide">
                                    {step.title}
                                </h2>
                            </div>
                            <button
                                onClick={handleSkip}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono transition-colors"
                            >
                                SKIP
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-[var(--text-secondary)] font-body text-sm leading-relaxed whitespace-pre-line">
                            {step.content}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
                        <div className="flex gap-1">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep
                                            ? 'bg-[var(--accent)]'
                                            : idx < currentStep
                                                ? 'bg-[var(--accent)]/40'
                                                : 'bg-[var(--border)]'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-mono text-xs font-semibold rounded hover:bg-[var(--accent)]/90 transition-colors"
                        >
                            {isLastStep ? 'START OPERATION' : 'NEXT'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
