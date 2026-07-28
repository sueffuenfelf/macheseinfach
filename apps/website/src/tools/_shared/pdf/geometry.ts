/** ISO A4 in PDF points (72 dpi). */
export const A4_POINTS = { width: 595.28, height: 841.89 } as const;

export function fitRect(
    srcW: number,
    srcH: number,
    destW: number,
    destH: number,
    mode: 'contain' | 'cover' | 'stretch' = 'contain',
): { x: number; y: number; width: number; height: number } {
    if (mode === 'stretch') {
        return { x: 0, y: 0, width: destW, height: destH };
    }
    const scale =
        mode === 'cover'
            ? Math.max(destW / srcW, destH / srcH)
            : Math.min(destW / srcW, destH / srcH);
    const width = srcW * scale;
    const height = srcH * scale;
    return {
        x: (destW - width) / 2,
        y: (destH - height) / 2,
        width,
        height,
    };
}
