'use client';

// components/ui/LiveCounter.tsx - Incrementing number display

import { useEffect, useState } from 'react';

interface LiveCounterProps {
    value: number;
    rate?: number; // increment per second
    format?: 'number' | 'compact';
    className?: string;
}

export default function LiveCounter({
    value,
    rate = 0,
    format = 'number',
    className = ''
}: LiveCounterProps) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    useEffect(() => {
        if (rate <= 0) return;

        const interval = setInterval(() => {
            setDisplayValue(prev => prev + Math.ceil(rate));
        }, 1000);

        return () => clearInterval(interval);
    }, [rate]);

    const formatted = format === 'compact'
        ? formatCompact(displayValue)
        : displayValue.toLocaleString();

    return (
        <span className={`data-value tabular-nums ${className}`}>
            {formatted}
        </span>
    );
}

function formatCompact(num: number): string {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
}
