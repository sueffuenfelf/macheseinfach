import { canvasToBlob, drawToCanvas, formatFromBlob, loadImageBitmap } from './canvas';
import { convertImage } from './convert';
import { getFormat } from './formats';
import { type Quad, isConvexQuad, isUnitQuad, quadNaturalSize, warpImageData } from './perspective';
import { computeResizeDimensions } from './resize-dimensions';
import type { ImageFormatId } from './types';

export { computeResizeDimensions } from './resize-dimensions';

export type ResizeOptions = {
    maxWidth?: number;
    maxHeight?: number;
    format?: ImageFormatId;
    quality?: number;
    /**
     * Ausgewähltes Viereck in Koordinaten relativ zum Quellbild: (0,0) ist links
     * oben, (1,1) rechts unten. Die vier Ecken liegen frei, Kanten müssen nicht
     * achsenparallel sein.
     *
     * Ist es gesetzt und kein Einheitsrechteck, wird die markierte Fläche beim
     * Export projektiv zu einem Rechteck entzerrt („Cut"). Die Kantenlängen der
     * Ausgabe folgen dabei den Kanten des Vierecks, gedeckelt durch max. Breite/Höhe.
     */
    quad?: Quad;
};

/** Formate ohne Alphakanal — freigestellte Bereiche brauchen einen Hintergrund. */
const OPAQUE_FORMATS = new Set<ImageFormatId>(['jpg']);

function scaleQuad(quad: Quad, width: number, height: number): Quad {
    return quad.map((point) => ({ x: point.x * width, y: point.y * height })) as Quad;
}

export async function resizeImage(
    blob: Blob,
    filename: string,
    options: ResizeOptions,
): Promise<Blob> {
    const sourceFormat = formatFromBlob(blob, filename);
    const formatId = options.format ?? sourceFormat;
    const quality = options.quality ?? 0.92;

    let workingBlob = blob;
    if (sourceFormat === 'heic') {
        workingBlob = await convertImage(blob, 'heic', formatId === 'heic' ? 'jpg' : formatId);
    }

    const bitmap = await loadImageBitmap(workingBlob);
    const target = getFormat(formatId === 'heic' ? 'jpg' : formatId);

    const quad = options.quad;
    const useWarp = quad !== undefined && !isUnitQuad(quad) && isConvexQuad(quad);

    // Ohne Ausschnitt zählt das ganze Quellbild, mit Ausschnitt dessen Kantenlängen.
    const selection = useWarp
        ? quadNaturalSize(scaleQuad(quad, bitmap.width, bitmap.height))
        : null;
    const { width, height } = computeResizeDimensions(
        selection ? Math.max(1, Math.round(selection.width)) : bitmap.width,
        selection ? Math.max(1, Math.round(selection.height)) : bitmap.height,
        options.maxWidth,
        options.maxHeight,
    );

    const canvas =
        useWarp && quad
            ? await drawWarped(bitmap, quad, width, height, OPAQUE_FORMATS.has(target.id))
            : await drawToCanvas(bitmap, width, height, (ctx) => {
                  ctx.drawImage(bitmap, 0, 0, width, height);
              });
    bitmap.close();

    return canvasToBlob(canvas, target.mime, quality);
}

async function drawWarped(
    bitmap: ImageBitmap,
    quad: Quad,
    width: number,
    height: number,
    fillBackground: boolean,
): Promise<HTMLCanvasElement> {
    const source = await drawToCanvas(bitmap, bitmap.width, bitmap.height, (ctx) => {
        ctx.drawImage(bitmap, 0, 0);
    });
    const sourceCtx = source.getContext('2d');
    if (!sourceCtx) throw new Error('Canvas-Kontext nicht verfügbar');
    const sourceData = sourceCtx.getImageData(0, 0, bitmap.width, bitmap.height);

    // Das Viereck markiert die Fläche im Quellbild, die zum Rechteck entzerrt wird.
    const warped = warpImageData(
        sourceData,
        scaleQuad(quad, bitmap.width, bitmap.height),
        width,
        height,
    );
    if (!warped) throw new Error('Entzerrung fehlgeschlagen — Eckpunkte prüfen');

    return drawToCanvas(bitmap, width, height, (ctx) => {
        if (fillBackground) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        }
        // Über den Hintergrund composited statt putImageData (das würde ihn ersetzen).
        const layer = document.createElement('canvas');
        layer.width = width;
        layer.height = height;
        layer.getContext('2d')?.putImageData(warped.data, 0, 0);
        ctx.drawImage(layer, 0, 0);
    });
}
