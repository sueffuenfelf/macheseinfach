import type { ExtractField } from '../_shared/shells';
import { rgbToHex } from '../_shared/color';

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht geladen werden.')); };
        img.src = url;
    });
}

function sampleColors(img: HTMLImageElement, samples = 12): string[] {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const colors: string[] = [];
    const step = Math.floor((size * size) / samples);
    for (let i = 0; i < samples; i++) {
        const px = i * step * 4;
        colors.push(rgbToHex({ r: data[px]!, g: data[px + 1]!, b: data[px + 2]! }));
    }
    return [...new Set(colors)];
}

export async function extractImageColors(input: { file?: File }): Promise<ExtractField[]> {
    const file = input.file;
    if (!file) return [{ id: 'err', label: 'Fehler', value: 'Keine Datei' }];
    const img = await loadImage(file);
    const colors = sampleColors(img);
    const dominant = colors[0] ?? '—';
    const fields: ExtractField[] = [
        { id: 'dominant', label: 'Dominante Farbe', value: dominant, mono: true },
        { id: 'size', label: 'Bildgröße', value: `${img.naturalWidth} × ${img.naturalHeight} px` },
    ];
    colors.slice(0, 8).forEach((c, i) => {
        fields.push({ id: `c${i}`, label: `Farbe ${i + 1}`, value: c, mono: true });
    });
    return fields;
}
