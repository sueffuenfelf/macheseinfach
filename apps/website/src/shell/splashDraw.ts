/**
 * Session splash stroke-draw timeline (ms).
 * CSS keyframes in index.css mirror these values via custom properties.
 */
export const SPLASH_DRAW = {
    mStroke: { duration: 800, delay: 0, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    mFill: { duration: 350, delay: 520 },
    checkInner: { duration: 420, delay: 780, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    checkStroke: { duration: 420, delay: 780, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' },
    /** Minimum splash display time (ms). Draw finishes ~1.28s; logo holds until this elapses. */
    totalMin: 3000,
} as const;

export const SPLASH_EXIT_MS = 520;
