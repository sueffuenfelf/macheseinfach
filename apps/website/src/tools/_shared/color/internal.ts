export function clampByte(n: number): number {
    return Math.min(255, Math.max(0, Math.round(n)));
}

export function clamp01(n: number): number {
    return Math.min(1, Math.max(0, n));
}
