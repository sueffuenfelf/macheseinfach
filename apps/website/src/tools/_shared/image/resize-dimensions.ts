export function computeResizeDimensions(
    width: number,
    height: number,
    maxWidth?: number,
    maxHeight?: number,
): { width: number; height: number } {
    if (width <= 0 || height <= 0) return { width: 0, height: 0 };

    const hasMaxW = typeof maxWidth === 'number' && maxWidth > 0;
    const hasMaxH = typeof maxHeight === 'number' && maxHeight > 0;

    if (!hasMaxW && !hasMaxH) return { width, height };

    let targetW = width;
    let targetH = height;

    if (hasMaxW && targetW > maxWidth) {
        targetH = Math.round((targetH * maxWidth) / targetW);
        targetW = maxWidth;
    }
    if (hasMaxH && targetH > maxHeight) {
        targetW = Math.round((targetW * maxHeight) / targetH);
        targetH = maxHeight;
    }

    return { width: Math.max(1, targetW), height: Math.max(1, targetH) };
}
