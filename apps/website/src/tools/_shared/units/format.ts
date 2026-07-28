/** German number formatting for unit results. */
export function fmtUnit(n: number, maxDecimals = 6): string {
    return n.toLocaleString('de-DE', { maximumFractionDigits: maxDecimals });
}
