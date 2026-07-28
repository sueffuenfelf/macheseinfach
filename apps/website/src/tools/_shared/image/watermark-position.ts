export type WatermarkPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';

export function watermarkAnchor(
    position: WatermarkPosition,
    imageWidth: number,
    imageHeight: number,
    textWidth: number,
    textHeight: number,
    padding: number,
): { x: number; y: number } {
    const pad = padding;
    const positions: Record<WatermarkPosition, { x: number; y: number }> = {
        'top-left': { x: pad, y: pad + textHeight },
        'top-center': { x: (imageWidth - textWidth) / 2, y: pad + textHeight },
        'top-right': { x: imageWidth - textWidth - pad, y: pad + textHeight },
        'center-left': { x: pad, y: (imageHeight + textHeight) / 2 },
        center: { x: (imageWidth - textWidth) / 2, y: (imageHeight + textHeight) / 2 },
        'center-right': { x: imageWidth - textWidth - pad, y: (imageHeight + textHeight) / 2 },
        'bottom-left': { x: pad, y: imageHeight - pad },
        'bottom-center': { x: (imageWidth - textWidth) / 2, y: imageHeight - pad },
        'bottom-right': { x: imageWidth - textWidth - pad, y: imageHeight - pad },
    };
    return positions[position];
}
