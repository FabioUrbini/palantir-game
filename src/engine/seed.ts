// engine/seed.ts - Seeded PRNG (mulberry32) + time-seed utilities

/**
 * Mulberry32 - Fast 32-bit seeded PRNG
 * Returns a function that produces random numbers between 0 and 1
 */
export function mulberry32(seed: number): () => number {
    return function () {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Create a seeded random function from a time value
 */
export function seededRandom(timeSeed: number): () => number {
    return mulberry32(timeSeed);
}

/**
 * Get the current seed from time, granulated to different intervals
 */
export function getSecondSeed(): number {
    return Math.floor(Date.now() / 1000); // changes every second
}

export function getMinuteSeed(): number {
    return Math.floor(Date.now() / 60000); // changes every minute
}

export function getHourSeed(): number {
    return Math.floor(Date.now() / 3600000); // changes every hour
}

export function getDaySeed(): number {
    return Math.floor(Date.now() / 86400000); // changes every day
}

/**
 * Get a seed for a specific past minute (for replaying history)
 */
export function getSeedForMinute(minuteIndex: number): number {
    return minuteIndex;
}

/**
 * Pick a random element from an array using the RNG
 */
export function pickRandom<T>(arr: T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)];
}

/**
 * Pick multiple random elements from an array (no duplicates)
 */
export function pickMultiple<T>(arr: T[], count: number, rng: () => number): T[] {
    const shuffled = [...arr].sort(() => rng() - 0.5);
    return shuffled.slice(0, count);
}
