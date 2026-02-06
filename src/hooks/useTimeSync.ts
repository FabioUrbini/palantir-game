// hooks/useTimeSync.ts - Current time tracking + seed computation

import { useState, useEffect } from 'react';

export interface TimeState {
    now: number;
    secondSeed: number;
    minuteSeed: number;
    hourSeed: number;
    daySeed: number;
}

/**
 * Hook that tracks the current time and computes seeds at different granularities
 * Updates every second
 */
export function useTimeSync(): TimeState {
    const [state, setState] = useState<TimeState>(() => computeTimeState());

    useEffect(() => {
        const interval = setInterval(() => {
            setState(computeTimeState());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return state;
}

function computeTimeState(): TimeState {
    const now = Date.now();
    return {
        now,
        secondSeed: Math.floor(now / 1000),
        minuteSeed: Math.floor(now / 60000),
        hourSeed: Math.floor(now / 3600000),
        daySeed: Math.floor(now / 86400000),
    };
}
