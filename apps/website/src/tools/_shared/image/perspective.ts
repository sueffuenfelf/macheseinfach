export type Point = { x: number; y: number };

/** Ecken im Uhrzeigersinn ab links oben. */
export type Quad = [Point, Point, Point, Point];

/** Homographie als flache 3×3-Matrix in Zeilenmajor-Reihenfolge. */
export type Homography = readonly number[];

/**
 * Löst A·x = b per Gauß-Elimination mit Spaltenpivotisierung.
 * `a` wird dabei in-place verändert.
 */
function solveLinearSystem(a: number[][], b: number[]): number[] | null {
    const n = b.length;

    for (let col = 0; col < n; col += 1) {
        let pivot = col;
        for (let row = col + 1; row < n; row += 1) {
            if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
        }
        if (Math.abs(a[pivot][col]) < 1e-12) return null;

        if (pivot !== col) {
            [a[pivot], a[col]] = [a[col], a[pivot]];
            [b[pivot], b[col]] = [b[col], b[pivot]];
        }

        const diag = a[col][col];
        for (let row = col + 1; row < n; row += 1) {
            const factor = a[row][col] / diag;
            if (factor === 0) continue;
            for (let k = col; k < n; k += 1) a[row][k] -= factor * a[col][k];
            b[row] -= factor * b[col];
        }
    }

    const x = new Array<number>(n).fill(0);
    for (let row = n - 1; row >= 0; row -= 1) {
        let sum = b[row];
        for (let k = row + 1; k < n; k += 1) sum -= a[row][k] * x[k];
        x[row] = sum / a[row][row];
    }
    return x;
}

/**
 * Berechnet die Homographie, die `from` auf `to` abbildet.
 *
 * Für die Rückwärtsabbildung (Ziel → Quelle) reicht es, die Argumente zu tauschen —
 * eine Matrixinversion ist nicht nötig.
 *
 * Gibt `null` zurück, wenn das Viereck entartet ist.
 */
export function solveHomography(from: Quad, to: Quad): Homography | null {
    const a: number[][] = [];
    const b: number[] = [];

    for (let i = 0; i < 4; i += 1) {
        const { x, y } = from[i];
        const { x: u, y: v } = to[i];
        a.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
        b.push(u);
        a.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
        b.push(v);
    }

    const solution = solveLinearSystem(a, b);
    if (!solution || solution.some((value) => !Number.isFinite(value))) return null;
    return [...solution, 1];
}

export function applyHomography(h: Homography, point: Point): Point {
    const w = h[6] * point.x + h[7] * point.y + h[8];
    if (Math.abs(w) < 1e-12) return { x: Number.NaN, y: Number.NaN };
    return {
        x: (h[0] * point.x + h[1] * point.y + h[2]) / w,
        y: (h[3] * point.x + h[4] * point.y + h[5]) / w,
    };
}

function distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Natürliche Kantenlängen des entzerrten Rechtecks: je die längere der beiden
 * gegenüberliegenden Kanten. Das hält den Inhalt an der weitesten Stelle
 * verzerrungsfrei, statt ihn auf die kürzere Kante zu stauchen.
 */
export function quadNaturalSize(quad: Quad): { width: number; height: number } {
    const [tl, tr, br, bl] = quad;
    return {
        width: Math.max(distance(tl, tr), distance(bl, br)),
        height: Math.max(distance(tl, bl), distance(tr, br)),
    };
}

function cross(o: Point, a: Point, b: Point): number {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Prüft, ob das Viereck konvex und nicht selbstüberschneidend ist. Nur solche
 * Vierecke ergeben eine invertierbare, sinnvoll darstellbare Transformation.
 */
export function isConvexQuad(quad: Quad): boolean {
    let sign = 0;
    for (let i = 0; i < 4; i += 1) {
        const value = cross(quad[i], quad[(i + 1) % 4], quad[(i + 2) % 4]);
        if (Math.abs(value) < 1e-9) return false;
        const current = value > 0 ? 1 : -1;
        if (sign === 0) sign = current;
        else if (sign !== current) return false;
    }
    return true;
}

export function rectToQuad(width: number, height: number): Quad {
    return [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
    ];
}

/** Das unveränderte Auswahlrechteck über dem ganzen Bild (relative Koordinaten). */
export const UNIT_QUAD: Quad = rectToQuad(1, 1);

/** Deckt das Viereck exakt das ganze Bild ab, ist kein Entzerren nötig. */
export function isUnitQuad(quad: Quad): boolean {
    return quad.every(
        (point, i) =>
            Math.abs(point.x - UNIT_QUAD[i].x) < 1e-6 && Math.abs(point.y - UNIT_QUAD[i].y) < 1e-6,
    );
}

function sampleBilinear(
    src: Uint8ClampedArray,
    srcWidth: number,
    srcHeight: number,
    x: number,
    y: number,
    out: Uint8ClampedArray,
    outOffset: number,
): void {
    if (x < -0.5 || y < -0.5 || x > srcWidth - 0.5 || y > srcHeight - 0.5) {
        out[outOffset] = 0;
        out[outOffset + 1] = 0;
        out[outOffset + 2] = 0;
        out[outOffset + 3] = 0;
        return;
    }

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;

    const clampX = (value: number) => Math.min(srcWidth - 1, Math.max(0, value));
    const clampY = (value: number) => Math.min(srcHeight - 1, Math.max(0, value));

    const x0c = clampX(x0);
    const x1c = clampX(x0 + 1);
    const y0c = clampY(y0);
    const y1c = clampY(y0 + 1);

    const i00 = (y0c * srcWidth + x0c) * 4;
    const i10 = (y0c * srcWidth + x1c) * 4;
    const i01 = (y1c * srcWidth + x0c) * 4;
    const i11 = (y1c * srcWidth + x1c) * 4;

    const w00 = (1 - fx) * (1 - fy);
    const w10 = fx * (1 - fy);
    const w01 = (1 - fx) * fy;
    const w11 = fx * fy;

    for (let channel = 0; channel < 4; channel += 1) {
        out[outOffset + channel] =
            src[i00 + channel] * w00 +
            src[i10 + channel] * w10 +
            src[i01 + channel] * w01 +
            src[i11 + channel] * w11;
    }
}

export type WarpResult = {
    data: ImageData;
    width: number;
    height: number;
};

/**
 * Entzerrt die vom Viereck `sourceQuad` markierte Fläche des Quellbilds in ein
 * achsenparalleles Rechteck der Größe `outWidth × outHeight`.
 *
 * `sourceQuad` liegt in Pixelkoordinaten des Quellbilds. Die Abbildung läuft invers —
 * jedes Ausgabepixel fragt seine Quellposition ab und wird bilinear interpoliert.
 * Liegt eine Ecke außerhalb des Bilds, bleiben die betroffenen Pixel transparent.
 */
export function warpImageData(
    source: ImageData,
    sourceQuad: Quad,
    outWidth: number,
    outHeight: number,
): WarpResult | null {
    const width = Math.max(1, Math.round(outWidth));
    const height = Math.max(1, Math.round(outHeight));

    // Ziel → Quelle: Argumente vertauscht, damit keine Inversion nötig ist.
    const inverse = solveHomography(rectToQuad(width, height), sourceQuad);
    if (!inverse) return null;

    const out = new ImageData(width, height);
    const src = source.data;

    for (let y = 0; y < height; y += 1) {
        const py = y + 0.5;
        for (let x = 0; x < width; x += 1) {
            const px = x + 0.5;
            const w = inverse[6] * px + inverse[7] * py + inverse[8];
            const offset = (y * width + x) * 4;
            if (Math.abs(w) < 1e-12) {
                out.data[offset + 3] = 0;
                continue;
            }
            sampleBilinear(
                src,
                source.width,
                source.height,
                (inverse[0] * px + inverse[1] * py + inverse[2]) / w - 0.5,
                (inverse[3] * px + inverse[4] * py + inverse[5]) / w - 0.5,
                out.data,
                offset,
            );
        }
    }

    return { data: out, width, height };
}
