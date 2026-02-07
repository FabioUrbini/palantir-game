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
        title: '🔮 Welcome to Operation Ghost Protocol',
        content: 'You are an intelligence analyst tasked with investigating a complex criminal network. This is a **living simulation** - entities spawn, connections form, and threats evolve in real-time.\n\n⚠️ Your decisions have consequences. Use your resources wisely to uncover connections and neutralize threats before they escalate.\n\n🎯 Complete objectives to earn rewards and influence.',
        position: 'center',
    },
    {
        id: 'interface',
        title: '🖥️ Command Interface Overview',
        content: '**TOP BAR** - Your command center showing:\n• Operation phase and time elapsed\n• 5 analytical views (GRAPH, MAP, ANALYTICS, TIMELINE, QUERY)\n• Time speed controls (⏸️ pause, ⏯️ 1x, ⏭️ 2x, ⏩ 5x)\n\n**ALERT TICKER** - Live feed of critical events scrolling across the screen\n\n**LEFT PANEL** - Data source monitoring\n**RIGHT PANEL** - Selected entity details & actions\n**BOTTOM TIMELINE** - Recent event history',
        position: 'top',
    },
    {
        id: 'resources',
        title: '💰 Resource Management',
        content: 'Monitor your resources in the **top-right corner**:\n\n💵 **Budget**: $10,000 starting (regenerates +$100/min)\n  └─ Used for investigations and major operations\n\n👥 **Agents**: 8/10 available (regenerates +1 every 5 min)\n  └─ Deploy for watchlists and monitoring\n\n📊 **Data Credits**: 10 available (regenerates +1 every 2 min)\n  └─ Required for intel requests\n\n⭐ **Influence**: 50 points\n  └─ Earned by completing objectives\n\n⚠️ Manage carefully - running out of resources means you can\'t respond to threats!',
        position: 'top',
    },
    {
        id: 'entities',
        title: '🕸️ Entity Network Navigation',
        content: '**GRAPH VIEW** shows your intelligence network:\n\n**COMMAND**: **Click any node** to select and view entity details\n\n**Threat Levels** (color-coded):\n🔴 **CRITICAL** - Immediate danger, investigate urgently\n🟠 **HIGH** - Significant threat, prioritize soon\n🟡 **MEDIUM** - Moderate risk, monitor closely\n🟢 **LOW** - Minimal threat, standard tracking\n\n**Lines** show connections - thicker = stronger relationship\n**Glowing nodes** = recent activity or new intel',
        position: 'center',
    },
    {
        id: 'investigation',
        title: '🔍 Investigation Commands',
        content: '**Select an entity** to unlock these actions in the right panel:\n\n**FLAG PRIORITY** 📌 (FREE)\n└─ Mark entity for quick access and tracking\n\n**REQUEST INTEL** 🔎 ($100 + 1 credit)\n└─ Deepen investigation (3 levels total)\n└─ Level 2: Reveals hidden connections\n└─ Level 3: Reduces threat by 30%!\n\n**ADD TO WATCHLIST** 👁️ (1 agent)\n└─ Continuous monitoring and alerts\n\n**MARK RESOLVED** ✅ (FREE)\n└─ Close case and remove from active threats\n\n💡 **TIP**: Investigate critical entities to Level 3 for maximum threat reduction!',
        position: 'right',
    },
    {
        id: 'alerts',
        title: '⚠️ Time-Sensitive Alert Protocol',
        content: 'Critical alerts will **interrupt your analysis** every 2-3 minutes with a modal dialog.\n\n**YOU MUST CHOOSE A RESPONSE:**\n\n🚨 **LAUNCH INVESTIGATION** ($500, 2 agents, 2 credits)\n└─ Deep analysis, major threat reduction (-50%)\n└─ Best for critical threats\n\n👁️ **ENHANCED MONITORING** (1 agent)\n└─ Passive surveillance, stabilizes threat\n└─ Good for medium threats\n\n⏭️ **ACKNOWLEDGE ONLY** (FREE)\n└─ Dismiss alert, but threat may escalate! (+20% risk)\n└─ Use sparingly\n\n⏱️ **Time limit**: You have 60 seconds to respond or alert auto-dismisses!',
        position: 'center',
    },
    {
        id: 'views',
        title: '📊 Analytical View Commands',
        content: 'Switch between views using **top navigation bar**:\n\n**GRAPH** 🕸️ - Network visualization (drag nodes, click to select)\n**MAP** 🗺️ - Geographic distribution (see threat locations)\n**ANALYTICS** 📈 - Charts & KPIs (threat trends, risk matrix)\n**TIMELINE** ⏱️ - Event chronology (filter by severity/source)\n**QUERY** 🔍 - Entity search (build queries, export results)\n\n💡 **TIP**: Use MAP view to identify geographic threat clusters!\n💡 **TIP**: ANALYTICS shows threat evolution over time',
        position: 'top',
    },
    {
        id: 'objectives',
        title: '🎯 Mission Objectives & Tracking',
        content: '**COMMAND**: Click the **🎯 OBJECTIVES** button (bottom-right corner)\n\nActive missions you need to complete:\n\n🛡️ **PREVENT** - Investigate all critical entities (60 min)\n  └─ Reward: +20 Influence\n\n✅ **RESOLVE** - Mark 3 high-threat entities as resolved\n  └─ Reward: +$2,000 Budget\n\n💰 **MAINTAIN** - Keep budget above $5,000 (30 min)\n  └─ Reward: +15 Influence\n\n🔎 **INVESTIGATE** - Reach investigation level 3 on 2 entities\n  └─ Reward: +$1,500 Budget\n\n⏱️ Time-limited objectives will **FAIL** if not completed in time!',
        position: 'bottom',
    },
    {
        id: 'additional',
        title: '🏆 Additional Features',
        content: '**BOTTOM-RIGHT PANEL COMMANDS:**\n\n🏆 **ACHIEVEMENTS** - Track your accomplishments\n  └─ Unlock special achievements for strategic play\n  └─ Earn achievement points\n\n📋 **ALERT HISTORY** - Review past alerts\n  └─ See your previous responses\n  └─ Learn from past decisions\n\n**LEFT PANEL - DATA SOURCES:**\n  └─ Toggle sources on/off to filter entities\n  └─ Monitor data flow rates and confidence levels\n\n💾 **AUTO-SAVE**: Progress saves every 15 seconds\n⏸️ **PAUSE**: Use time controls to pause and strategize',
        position: 'bottom',
    },
    {
        id: 'ready',
        title: '✅ Tutorial Complete - Begin Operation',
        content: '**OPERATION STATUS: READY TO COMMENCE**\n\n📌 **Quick Command Reference:**\n• Click nodes to investigate\n• Use top bar to switch views\n• Monitor resources (top-right)\n• Respond to alerts promptly\n• Check objectives regularly (🎯 button)\n• Pause anytime to strategize (⏸️)\n\n⚡ The operation is **LIVE** - the simulation is already running!\n\n🎮 **Pro Tips:**\n• Investigate critical entities first\n• Save resources for emergency alerts\n• Complete objectives before time runs out\n• Level 3 investigations provide maximum value\n\n**Good luck, Analyst. The network is waiting...**',
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
