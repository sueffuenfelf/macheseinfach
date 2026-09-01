/** Parse "1,3,5-7" style specs into 0-based page indices (unique, sorted). */
export function parsePageSpec(spec: string, pageCount: number): number[] {
    const trimmed = spec.trim();
    if (!trimmed || pageCount <= 0) return [];

    const indices = new Set<number>();
    const parts = trimmed
        .split(/[,;]+/)
        .map((part) => part.trim())
        .filter(Boolean);

    for (const part of parts) {
        const range = part.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
        if (range) {
            let start = Number.parseInt(range[1]!, 10);
            let end = Number.parseInt(range[2]!, 10);
            if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
            if (start > end) [start, end] = [end, start];
            for (let page = start; page <= end; page++) {
                if (page >= 1 && page <= pageCount) indices.add(page - 1);
            }
            continue;
        }

        const single = Number.parseInt(part, 10);
        if (Number.isFinite(single) && single >= 1 && single <= pageCount) {
            indices.add(single - 1);
        }
    }

    return [...indices].sort((a, b) => a - b);
}

/** All page indices 0..pageCount-1 */
export function allPageIndices(pageCount: number): number[] {
    return Array.from({ length: Math.max(0, pageCount) }, (_, i) => i);
}

/** Validate and normalize a reorder list — must be a permutation of 0..n-1. */
export function normalizePageOrder(order: readonly number[], pageCount: number): number[] {
    if (pageCount <= 0) return [];
    if (order.length !== pageCount) return allPageIndices(pageCount);
    const seen = new Set<number>();
    for (const index of order) {
        if (!Number.isInteger(index) || index < 0 || index >= pageCount || seen.has(index)) {
            return allPageIndices(pageCount);
        }
        seen.add(index);
    }
    return [...order];
}

export function moveIndex<T>(items: readonly T[], from: number, to: number): T[] {
    if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) {
        return [...items];
    }
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    return next;
}

export type RotateDegrees = 0 | 90 | 180 | 270;

export function normalizeRotateDegrees(value: number): RotateDegrees {
    const normalized = (((Math.round(value / 90) * 90) % 360) + 360) % 360;
    if (normalized === 90 || normalized === 180 || normalized === 270) return normalized;
    return 0;
}

export function addRotateDegrees(current: number, delta: RotateDegrees): RotateDegrees {
    return normalizeRotateDegrees(current + delta);
}
