'use client';

// components/WelcomeModal.tsx - Tutorial modal for first-time users

import { useState, useEffect } from 'react';
import { isTutorialCompleted, setTutorialCompleted } from '../hooks/usePersistence';

interface TutorialStep {
    title: string;
    content: string;
    icon: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
    {
        title: 'Welcome to PALANTIR GOTHAM',
        content: 'You are an intelligence analyst monitoring Operation Nightfall. Your mission: track threats, investigate entities, and prevent hostile operations. The simulation runs in real-time — new events, connections, and threats emerge as time passes.',
        icon: '🎯',
    },
    {
        title: 'Resource Management',
        content: 'You have limited resources: BUDGET for investigations, AGENTS for surveillance, DATA CREDITS for intel requests, and INFLUENCE for high-level decisions. Resources regenerate over time, so spend wisely and prioritize critical threats.',
        icon: '💰',
    },
    {
        title: 'Entity Investigation',
        content: 'Click any entity (person, company, location) to view details. Use the action buttons to: FLAG as priority, REQUEST INTEL (costs resources), add to WATCHLIST, or RESOLVE when handled. Investigating entities reveals hidden connections and reduces threat levels.',
        icon: '🔍',
    },
    {
        title: 'Alert Response',
        content: 'Critical events trigger interactive alerts requiring your response. Choose wisely — launching investigations costs more but reduces threats significantly, while dismissing alerts may cause threats to escalate. Your decisions shape the simulation.',
        icon: '⚠️',
    },
    {
        title: 'Mission Objectives',
        content: 'Click the 🎯 OBJECTIVES button to view your active missions. Complete objectives to earn rewards (budget and influence). Track your progress and prioritize tasks based on time limits and threat levels. Good luck, Analyst!',
        icon: '✅',
    },
];

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only run on client
        setMounted(true);
        // Show modal if tutorial not completed
        if (!isTutorialCompleted()) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        setTutorialCompleted(true);
        setIsOpen(false);
        setCurrentStep(0);
    };

    // Function to reopen (can be called from Dashboard)
    const reopen = () => {
        setCurrentStep(0);
        setIsOpen(true);
    };

    // Expose reopen function globally for Dashboard to access
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as unknown as { reopenTutorial?: () => void }).reopenTutorial = reopen;
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete (window as unknown as { reopenTutorial?: () => void }).reopenTutorial;
            }
        };
    }, []);

    if (!mounted || !isOpen) return null;

    const step = TUTORIAL_STEPS[currentStep];
    const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-bg-secondary border border-[var(--border-active)] rounded-lg shadow-2xl shadow-accent/10 animate-fade-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-lg">
                            {step.icon}
                        </div>
                        <span className="font-mono text-[10px] tracking-[2px] text-[var(--text-secondary)]">
                            TUTORIAL {currentStep + 1}/{TUTORIAL_STEPS.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSkip}
                        className="text-[var(--text-secondary)] hover:text-white transition-colors text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    <h2 className="text-xl font-bold text-accent mb-4">
                        {step.title}
                    </h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                        {step.content}
                    </p>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 pb-4">
                    {TUTORIAL_STEPS.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentStep(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentStep
                                ? 'bg-accent w-6'
                                : idx < currentStep
                                    ? 'bg-accent/50'
                                    : 'bg-[var(--text-muted)]'
                                }`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-[var(--border)] flex justify-between">
                    <button
                        onClick={handleSkip}
                        className="px-4 py-2 font-mono text-[10px] tracking-[1px] text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                        SKIP TUTORIAL
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 font-mono text-[10px] tracking-[1px] bg-accent text-black rounded hover:bg-accent/80 transition-colors"
                    >
                        {isLastStep ? 'START MISSION' : 'NEXT →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
