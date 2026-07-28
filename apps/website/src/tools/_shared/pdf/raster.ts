import { PDFDocument } from 'pdf-lib';
import { A4_POINTS, fitRect } from './geometry';
import { loadPdfJsDocument, renderPdfPage } from './pdfjs';

export { A4_POINTS, fitRect } from './geometry';

export async function canvasToJpegBytes(
    canvas: HTMLCanvasElement,
    quality = 0.85,
): Promise<Uint8Array> {
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error('JPEG encode failed'))),
            'image/jpeg',
            Math.max(0.1, Math.min(1, quality)),
        );
    });
    return new Uint8Array(await blob.arrayBuffer());
}

/** Convert canvas pixels to grayscale in place. */
export function applyGrayscaleInPlace(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = image.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
    ctx.putImageData(image, 0, 0);
}

export type RasterizeOptions = {
    scale?: number;
    quality?: number;
    grayscale?: boolean;
    password?: string;
    /** Override output page size (PDF points). Defaults to source page size. */
    pageSize?: { width: number; height: number } | 'a4' | 'source';
    fit?: 'contain' | 'cover' | 'stretch';
};

/**
 * Rasterize PDF pages via pdfjs into a new (unencrypted) PDF.
 * Used for grayscale, unlock, and lossy transforms.
 */
export async function rasterizePdfPages(
    file: File,
    options: RasterizeOptions = {},
): Promise<Uint8Array> {
    const scale = options.scale ?? 1.5;
    const quality = options.quality ?? 0.85;
    const jsDoc = await loadPdfJsDocument(file, options.password);
    const output = await PDFDocument.create();
    const pageCount = jsDoc.numPages;

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const rendered = await renderPdfPage(jsDoc, pageIndex, scale);
        if (options.grayscale) applyGrayscaleInPlace(rendered.canvas);

        const jpgBytes = await canvasToJpegBytes(rendered.canvas, quality);
        const embedded = await output.embedJpg(jpgBytes);

        let pageWidth = rendered.width / scale;
        let pageHeight = rendered.height / scale;

        if (options.pageSize === 'a4') {
            pageWidth = A4_POINTS.width;
            pageHeight = A4_POINTS.height;
        } else if (options.pageSize && options.pageSize !== 'source') {
            pageWidth = options.pageSize.width;
            pageHeight = options.pageSize.height;
        }

        const page = output.addPage([pageWidth, pageHeight]);
        const draw = fitRect(
            embedded.width,
            embedded.height,
            pageWidth,
            pageHeight,
            options.pageSize === 'a4' || (options.pageSize && options.pageSize !== 'source')
                ? (options.fit ?? 'contain')
                : 'stretch',
        );
        page.drawImage(embedded, draw);
    }

    await jsDoc.destroy?.();
    return output.save({ useObjectStreams: true });
}
