'use client';

// components/ToastNotification.tsx - Toast notification display

import { useToast, Toast } from '../hooks/useToast';

const TOAST_COLORS: Record<Toast['type'], { bg: string; border: string; icon: string }> = {
    success: {
        bg: 'bg-[#30d158]/10',
        border: 'border-[#30d158]/30',
        icon: '✓',
    },
    warning: {
        bg: 'bg-threat-medium/10',
        border: 'border-threat-medium/30',
        icon: '⚠',
    },
    info: {
        bg: 'bg-accent/10',
        border: 'border-accent/30',
        icon: 'ℹ',
    },
    error: {
        bg: 'bg-threat-critical/10',
        border: 'border-threat-critical/30',
        icon: '✕',
    },
};

export default function ToastNotification() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast, index) => {
                const colors = TOAST_COLORS[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            ${colors.bg} ${colors.border}
                            border rounded-lg px-4 py-3 
                            backdrop-blur-sm
                            shadow-lg shadow-black/20
                            max-w-sm
                            animate-slide-in-right
                            cursor-pointer
                            hover:scale-[1.02] transition-transform
                        `}
                        style={{
                            animationDelay: `${index * 50}ms`,
                        }}
                        onClick={() => dismissToast(toast.id)}
                    >
                        <div className="flex items-start gap-3">
                            <span className={`
                                text-lg font-bold
                                ${toast.type === 'success' ? 'text-[#30d158]' :
                                    toast.type === 'warning' ? 'text-threat-medium' :
                                        toast.type === 'info' ? 'text-accent' :
                                            'text-threat-critical'}
                            `}>
                                {colors.icon}
                            </span>
                            <div className="flex-1">
                                <p className="font-mono text-[11px] text-white leading-relaxed">
                                    {toast.message}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
