function gcd(a: number, b: number): number {
    let x = Math.abs(Math.round(a));
    let y = Math.abs(Math.round(b));
    while (y !== 0) {
        const t = y;
        y = x % y;
        x = t;
    }
    return x || 1;
}

/** Parse "3/4", "1 1/2", "0.5" style input. */
export function parseFractionInput(raw: string): number | null {
    const trimmed = raw.trim().replace(',', '.');
    if (!trimmed) return null;

    const mixed = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
    if (mixed) {
        const whole = Number(mixed[1]);
        const num = Number(mixed[2]);
        const den = Number(mixed[3]);
        if (den === 0) return null;
        return whole + (whole < 0 ? -num / den : num / den);
    }

    const simple = trimmed.match(/^(-?\d+)\/(\d+)$/);
    if (simple) {
        const num = Number(simple[1]);
        const den = Number(simple[2]);
        if (den === 0) return null;
        return num / den;
    }

    if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
}

/** Decimal → simplest fraction string (max denominator 10_000). */
export function decimalToFraction(value: number, maxDenominator = 10_000): string {
    if (!Number.isFinite(value)) return '';
    if (value === 0) return '0';

    const sign = value < 0 ? '-' : '';
    const abs = Math.abs(value);
    const whole = Math.floor(abs);
    const frac = abs - whole;

    if (frac < 1e-10) return `${sign}${whole}`;

    let bestNum = 0;
    let bestDen = 1;
    let bestErr = Number.POSITIVE_INFINITY;

    for (let den = 1; den <= maxDenominator; den++) {
        const num = Math.round(frac * den);
        const err = Math.abs(frac - num / den);
        if (err < bestErr) {
            bestErr = err;
            bestNum = num;
            bestDen = den;
            if (err < 1e-10) break;
        }
    }

    const g = gcd(bestNum, bestDen);
    const num = bestNum / g;
    const den = bestDen / g;

    if (whole === 0) return `${sign}${num}/${den}`;
    return `${sign}${whole} ${num}/${den}`;
}
