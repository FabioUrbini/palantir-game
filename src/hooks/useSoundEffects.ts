'use client';

// hooks/useSoundEffects.ts - Sound effects system for game actions

import { useCallback, useRef } from 'react';

export type SoundEffect =
    | 'investigate'
    | 'alert'
    | 'objective_complete'
    | 'entity_select'
    | 'resource_low'
    | 'connection_found';

/**
 * Hook for playing sound effects
 * Currently returns placeholder functions - actual audio files can be added later
 */
export function useSoundEffects() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const enabledRef = useRef(true);

    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current && typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    const playBeep = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
        if (!enabledRef.current) return;

        const ctx = getAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }, [getAudioContext]);

    const play = useCallback((effect: SoundEffect) => {
        switch (effect) {
            case 'investigate':
                playBeep(800, 0.1);
                setTimeout(() => playBeep(1000, 0.1), 100);
                break;
            case 'alert':
                playBeep(600, 0.15, 0.15);
                setTimeout(() => playBeep(400, 0.15, 0.15), 150);
                break;
            case 'objective_complete':
                playBeep(523, 0.1);
                setTimeout(() => playBeep(659, 0.1), 100);
                setTimeout(() => playBeep(784, 0.2), 200);
                break;
            case 'entity_select':
                playBeep(1200, 0.05, 0.05);
                break;
            case 'resource_low':
                playBeep(300, 0.3, 0.12);
                break;
            case 'connection_found':
                playBeep(900, 0.08);
                setTimeout(() => playBeep(1100, 0.08), 80);
                break;
        }
    }, [playBeep]);

    const toggle = useCallback(() => {
        enabledRef.current = !enabledRef.current;
        return enabledRef.current;
    }, []);

    const isEnabled = useCallback(() => {
        return enabledRef.current;
    }, []);

    return {
        play,
        toggle,
        isEnabled,
    };
}
