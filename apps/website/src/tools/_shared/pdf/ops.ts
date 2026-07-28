import { loadPdfJsDocument, renderPdfPage } from './pdfjs';
import { allPageIndices } from './pages';
import {
    applyGrayscaleInPlace,
    canvasToJpegBytes,
    rasterizePdfPages,
} from './raster';

export {
    fitPdfToA4,
    reorderPdfPages,
    rotatePdfPages,
    splitPdfBySpec,
    splitPdfEachPage,
    stampPdf,
    type StampOptions,
} from './mutate';

export async function grayscalePdf(file: File, quality = 0.82): Promise<Uint8Array> {
    return rasterizePdfPages(file, { grayscale: true, quality, scale: 1.4 });
}

export async function unlockPdf(file: File, password: string): Promise<Uint8Array> {
    if (!password.trim()) throw new Error('Passwort fehlt.');
    return rasterizePdfPages(file, {
        password: password.trim(),
        quality: 0.9,
        scale: 1.6,
    });
}

export type JpgPageResult = {
    pageIndex: number;
    blob: Blob;
    width: number;
    height: number;
};

export async function pdfPagesToJpg(
    file: File,
    options: { scale?: number; quality?: number; pageIndices?: number[]; grayscale?: boolean } = {},
): Promise<JpgPageResult[]> {
    const scale = options.scale ?? 2;
    const quality = options.quality ?? 0.88;
    const jsDoc = await loadPdfJsDocument(file);
    const targets = options.pageIndices?.length
        ? options.pageIndices
        : allPageIndices(jsDoc.numPages);

    const results: JpgPageResult[] = [];
    for (const pageIndex of targets) {
        if (pageIndex < 0 || pageIndex >= jsDoc.numPages) continue;
        const rendered = await renderPdfPage(jsDoc, pageIndex, scale);
        if (options.grayscale) applyGrayscaleInPlace(rendered.canvas);
        const bytes = await canvasToJpegBytes(rendered.canvas, quality);
        results.push({
            pageIndex,
            blob: new Blob([bytes.slice()], { type: 'image/jpeg' }),
            width: rendered.width,
            height: rendered.height,
        });
    }
    await jsDoc.destroy?.();
    return results;
}
