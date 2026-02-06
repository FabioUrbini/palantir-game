'use client';

// components/ui/Tooltip.tsx - Reusable tooltip component

import { useState, ReactNode } from 'react';

interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export default function Tooltip({
    content,
    children,
    position = 'top',
    delay = 300
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsVisible(false);
    };

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--bg-tertiary)] border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--bg-tertiary)] border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--bg-tertiary)] border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--bg-tertiary)] border-y-transparent border-l-transparent',
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
        >
            {children}
            {isVisible && (
                <div
                    role="tooltip"
                    className={`
                        absolute z-50 
                        ${positionClasses[position]}
                        px-3 py-2 
                        bg-[var(--bg-tertiary)] 
                        border border-[var(--border-active)]
                        rounded-md shadow-lg
                        animate-fade-in
                        pointer-events-none
                        whitespace-nowrap
                    `}
                >
                    <span className="font-mono text-[10px] text-white">
                        {content}
                    </span>
                    {/* Arrow */}
                    <div
                        className={`
                            absolute w-0 h-0 
                            border-4
                            ${arrowClasses[position]}
                        `}
                    />
                </div>
            )}
        </div>
    );
}
