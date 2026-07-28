import { PDFDocument } from 'pdf-lib';
import { loadPdfDocument } from './io';
import { loadPdfJsDocument, renderPdfPage } from './pdfjs';

export type RedactionBox = {
    pageIndex: number;
    /** PDF points, origin bottom-left */
    x: number;
    y: number;
    width: number;
    height: number;
};

const RASTER_SCALE = 2;

function drawRedactionBoxes(
    ctx: CanvasRenderingContext2D,
    boxes: RedactionBox[],
    pageWidthPt: number,
    pageHeightPt: number,
    canvasWidth: number,
    canvasHeight: number,
): void {
    const scaleX = canvasWidth / pageWidthPt;
    const scaleY = canvasHeight / pageHeightPt;

    ctx.fillStyle = '#000';
    for (const box of boxes) {
        const x = box.x * scaleX;
        const y = (pageHeightPt - box.y - box.height) * scaleY;
        ctx.fillRect(x, y, box.width * scaleX, box.height * scaleY);
    }
}

export async function exportRedactedPdf(file: File, boxes: RedactionBox[]): Promise<Uint8Array> {
    const sourcePdf = await loadPdfDocument(file);
    const jsDoc = await loadPdfJsDocument(file);
    const output = await PDFDocument.create();
    const pageCount = sourcePdf.getPageCount();

    const boxesByPage = new Map<number, RedactionBox[]>();
    for (const box of boxes) {
        const list = boxesByPage.get(box.pageIndex) ?? [];
        list.push(box);
        boxesByPage.set(box.pageIndex, list);
    }

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        const sourcePage = sourcePdf.getPage(pageIndex);
        const { width, height } = sourcePage.getSize();
        const pageBoxes = boxesByPage.get(pageIndex) ?? [];

        if (pageBoxes.length === 0) {
            const [copied] = await output.copyPages(sourcePdf, [pageIndex]);
            output.addPage(copied);
            continue;
        }

        const rendered = await renderPdfPage(jsDoc, pageIndex, RASTER_SCALE);
        const ctx = rendered.canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        drawRedactionBoxes(
            ctx,
            pageBoxes,
            width,
            height,
            rendered.canvas.width,
            rendered.canvas.height,
        );

        const pngBytes = await new Promise<Uint8Array>((resolve, reject) => {
            rendered.canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('PNG export failed'));
                    return;
                }
                resolve(new Uint8Array(await blob.arrayBuffer()));
            }, 'image/png');
        });

        const embedded = await output.embedPng(pngBytes);
        const page = output.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
    }

    return output.save({ useObjectStreams: true });
}
