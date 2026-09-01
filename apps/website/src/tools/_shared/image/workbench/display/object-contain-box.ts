export type ContainBox = { x: number; y: number; w: number; h: number };

/** Pixel box of an object-contain image inside its element. */
export function objectContainBox(
    naturalWidth: number,
    naturalHeight: number,
    clientWidth: number,
    clientHeight: number,
): ContainBox {
    if (naturalWidth <= 0 || naturalHeight <= 0 || clientWidth <= 0 || clientHeight <= 0) {
        return { x: 0, y: 0, w: 0, h: 0 };
    }
    const scale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
    const w = naturalWidth * scale;
    const h = naturalHeight * scale;
    return {
        x: (clientWidth - w) / 2,
        y: (clientHeight - h) / 2,
        w,
        h,
    };
}
