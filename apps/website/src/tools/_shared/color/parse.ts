export type Rgb = { r: number; g: number; b: number };

function clampByte(n: number): number {
    return Math.min(255, Math.max(0, Math.round(n)));
}

/** Parse #RGB, #RRGGBB or RRGGBB. */
export function parseHex(input: string): Rgb | null {
    const raw = input.trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(raw)) {
        const r = Number.parseInt(raw[0]! + raw[0], 16);
        const g = Number.parseInt(raw[1]! + raw[1], 16);
        const b = Number.parseInt(raw[2]! + raw[2], 16);
        return { r, g, b };
    }
    if (/^[0-9a-f]{6}$/i.test(raw)) {
        const r = Number.parseInt(raw.slice(0, 2), 16);
        const g = Number.parseInt(raw.slice(2, 4), 16);
        const b = Number.parseInt(raw.slice(4, 6), 16);
        return { r, g, b };
    }
    return null;
}

/** Parse rgb(r,g,b) or "r, g, b". */
export function parseRgb(input: string): Rgb | null {
    const trimmed = input.trim();
    const fn = trimmed.match(/^rgba?\(\s*([^)]+)\s*\)$/i);
    const parts = (fn ? fn[1] : trimmed).split(/[,\s]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    return { r: clampByte(r), g: clampByte(g), b: clampByte(b) };
}

/** Parse hex or rgb() input. */
export function parseColor(input: string): Rgb | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('#') || /^[0-9a-f]{3,6}$/i.test(trimmed)) {
        return parseHex(trimmed);
    }
    return parseRgb(trimmed);
}

export function rgbToHex({ r, g, b }: Rgb): string {
    const to = (n: number) => clampByte(n).toString(16).padStart(2, '0');
    return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function rgbToCss({ r, g, b }: Rgb): string {
    return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`;
}
