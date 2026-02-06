'use client';

// components/ui/AnimatedNumber.tsx - Count-up animation

import { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
    value: number;
    duration?: number; // ms
    format?: (n: number) => string;
    className?: string;
}

export default function AnimatedNumber({
    value,
    duration = 500,
    format = (n) => n.toLocaleString(),
    className = '',
}: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValue = useRef(value);

    useEffect(() => {
        const startValue = previousValue.current;
        const endValue = value;
        const diff = endValue - startValue;

        if (diff === 0) return;

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            const current = startValue + diff * eased;
            setDisplayValue(Math.round(current));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                previousValue.current = endValue;
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span className={`data-value tabular-nums ${className}`}>
            {format(displayValue)}
        </span>
    );
}
