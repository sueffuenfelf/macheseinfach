import { describe, expect, test } from 'bun:test';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { fitPdfToA4, reorderPdfPages, rotatePdfPages, splitPdfBySpec, stampPdf } from './mutate';
import { A4_POINTS } from './geometry';

async function makeSamplePdf(pageCount = 3): Promise<File> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    for (let i = 0; i < pageCount; i++) {
        const page = doc.addPage([400 + i * 20, 600]);
        page.drawText(`Seite ${i + 1}`, {
            x: 40,
            y: 500,
            size: 18,
            font,
            color: rgb(0, 0, 0),
        });
    }
    const bytes = await doc.save();
    return new File([bytes.slice()], 'sample.pdf', { type: 'application/pdf' });
}

describe('pdf ops smoke', () => {
    test('splitPdfBySpec extracts range', async () => {
        const file = await makeSamplePdf(4);
        const { pageCount, bytes } = await splitPdfBySpec(file, '2-3');
        expect(pageCount).toBe(2);
        const out = await PDFDocument.load(bytes);
        expect(out.getPageCount()).toBe(2);
    });

    test('rotatePdfPages updates rotation', async () => {
        const file = await makeSamplePdf(2);
        const bytes = await rotatePdfPages(file, { pageSpec: '1', degrees: 90 });
        const out = await PDFDocument.load(bytes);
        expect(out.getPage(0).getRotation().angle).toBe(90);
        expect(out.getPage(1).getRotation().angle).toBe(0);
    });

    test('reorderPdfPages permutes', async () => {
        const file = await makeSamplePdf(3);
        const bytes = await reorderPdfPages(file, [2, 0, 1]);
        const out = await PDFDocument.load(bytes);
        expect(out.getPageCount()).toBe(3);
    });

    test('fitPdfToA4 normalizes page size', async () => {
        const file = await makeSamplePdf(1);
        const bytes = await fitPdfToA4(file);
        const out = await PDFDocument.load(bytes);
        const { width, height } = out.getPage(0).getSize();
        expect(width).toBeCloseTo(A4_POINTS.width, 1);
        expect(height).toBeCloseTo(A4_POINTS.height, 1);
    });

    test('stampPdf draws text', async () => {
        const file = await makeSamplePdf(1);
        const bytes = await stampPdf(file, {
            text: 'Eingereicht am 28.07.2026',
            pageIndex: 0,
            x: 40,
            y: 40,
            fontSize: 12,
        });
        expect(bytes.byteLength).toBeGreaterThan(100);
    });
});
