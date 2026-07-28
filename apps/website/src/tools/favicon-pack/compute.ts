export const FAVICON_SIZES = [16, 32, 48, 180, 192, 512] as const;

export type FaviconSize = (typeof FAVICON_SIZES)[number];

export function faviconFilename(size: FaviconSize): string {
    if (size === 180) return 'apple-touch-icon.png';
    if (size === 192) return 'icon-192.png';
    if (size === 512) return 'icon-512.png';
    return `favicon-${size}x${size}.png`;
}

export function resizeToPng(img: HTMLImageElement, size: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas nicht verfügbar');
    const scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (size - w) / 2;
    const y = (size - h) / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, x, y, w, h);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('PNG-Export fehlgeschlagen'));
        }, 'image/png');
    });
}

export function loadImageFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Bild konnte nicht geladen werden'));
        };
        img.src = url;
    });
}
