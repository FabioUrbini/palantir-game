'use client';

// components/ui/MiniSparkline.tsx - Tiny inline sparkline chart

interface MiniSparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export default function MiniSparkline({
    data,
    width = 60,
    height = 20,
    color = 'var(--accent)',
    className = '',
}: MiniSparklineProps) {
    if (data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - min) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    // Create fill polygon
    const fillPoints = [
        `${padding},${height - padding}`,
        ...data.map((value, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((value - min) / range) * chartHeight;
            return `${x},${y}`;
        }),
        `${width - padding},${height - padding}`,
    ].join(' ');

    return (
        <svg
            width={width}
            height={height}
            className={className}
            style={{ overflow: 'visible' }}
        >
            {/* Fill area */}
            <polygon
                points={fillPoints}
                fill={color}
                fillOpacity={0.15}
            />
            {/* Line */}
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            {/* End dot */}
            {data.length > 0 && (
                <circle
                    cx={width - padding}
                    cy={padding + chartHeight - ((data[data.length - 1] - min) / range) * chartHeight}
                    r={2}
                    fill={color}
                />
            )}
        </svg>
    );
}
