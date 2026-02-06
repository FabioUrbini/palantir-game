'use client';

// components/ui/ProgressRing.tsx - SVG circular progress indicator

interface ProgressRingProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    showValue?: boolean;
    className?: string;
}

export default function ProgressRing({
    value,
    size = 48,
    strokeWidth = 4,
    color = 'var(--accent)',
    bgColor = 'rgba(0, 229, 255, 0.1)',
    showValue = true,
    className = '',
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={bgColor}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-out',
                    }}
                />
            </svg>
            {showValue && (
                <span
                    className="absolute data-value text-xs"
                    style={{ color }}
                >
                    {Math.round(value)}
                </span>
            )}
        </div>
    );
}
