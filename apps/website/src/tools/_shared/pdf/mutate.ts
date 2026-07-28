import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';
import { A4_POINTS, fitRect } from './geometry';
import { loadPdfDocument } from './io';
import { allPageIndices, normalizePageOrder, normalizeRotateDegrees, parsePageSpec } from './pages';

export async function splitPdfBySpec(
    file: File,
    spec: string,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
    const src = await loadPdfDocument(file);
    const indices = parsePageSpec(spec, src.getPageCount());
    if (!indices.length) throw new Error('Keine gültigen Seiten angegeben.');

    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    return { bytes: await out.save({ useObjectStreams: true }), pageCount: pages.length };
}

/** One PDF per page. */
export async function splitPdfEachPage(file: File): Promise<{ bytes: Uint8Array; label: string }[]> {
    const src = await loadPdfDocument(file);
    const count = src.getPageCount();
    const results: { bytes: Uint8Array; label: string }[] = [];

    for (let i = 0; i < count; i++) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page!);
        results.push({
            bytes: await out.save({ useObjectStreams: true }),
            label: `-seite-${i + 1}`,
        });
    }
    return results;
}

export async function rotatePdfPages(
    file: File,
    options: {
        /** Empty / "alle" → all pages */
        pageSpec?: string;
        degrees: number;
    },
): Promise<Uint8Array> {
    const pdf = await loadPdfDocument(file);
    const count = pdf.getPageCount();
    const delta = normalizeRotateDegrees(options.degrees);
    const targets =
        !options.pageSpec?.trim() || options.pageSpec.trim().toLowerCase() === 'alle'
            ? allPageIndices(count)
            : parsePageSpec(options.pageSpec, count);

    if (!targets.length) throw new Error('Keine gültigen Seiten angegeben.');

    for (const index of targets) {
        const page = pdf.getPage(index);
        const current = page.getRotation().angle;
        page.setRotation(degrees(normalizeRotateDegrees(current + delta)));
    }

    return pdf.save({ useObjectStreams: true });
}

export async function reorderPdfPages(file: File, order: readonly number[]): Promise<Uint8Array> {
    const src = await loadPdfDocument(file);
    const indices = normalizePageOrder(order, src.getPageCount());
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, indices);
    for (const page of pages) out.addPage(page);
    return out.save({ useObjectStreams: true });
}

/** Fit every page onto A4 (matching source orientation), preserving aspect — vector when possible. */
export async function fitPdfToA4(file: File): Promise<Uint8Array> {
    const src = await loadPdfDocument(file);
    const out = await PDFDocument.create();
    const count = src.getPageCount();

    for (let i = 0; i < count; i++) {
        const [embedded] = await out.embedPdf(src, [i]);
        const landscape = embedded!.width > embedded!.height;
        const pageWidth = landscape ? A4_POINTS.height : A4_POINTS.width;
        const pageHeight = landscape ? A4_POINTS.width : A4_POINTS.height;
        const page = out.addPage([pageWidth, pageHeight]);
        const draw = fitRect(embedded!.width, embedded!.height, pageWidth, pageHeight, 'contain');
        page.drawPage(embedded!, draw);
    }

    return out.save({ useObjectStreams: true });
}

export type StampOptions = {
    text: string;
    pageIndex: number;
    /** PDF coordinates (origin bottom-left) */
    x: number;
    y: number;
    fontSize?: number;
    opacity?: number;
};

export async function stampPdf(file: File, options: StampOptions): Promise<Uint8Array> {
    const pdf = await loadPdfDocument(file);
    const page = pdf.getPage(options.pageIndex);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const size = options.fontSize ?? 14;
    const text = options.text.trim();
    if (!text) throw new Error('Stempeltext fehlt.');

    page.drawText(text, {
        x: options.x,
        y: options.y,
        size,
        font,
        color: rgb(0.75, 0.1, 0.1),
        opacity: options.opacity ?? 0.85,
    });

    return pdf.save({ useObjectStreams: true });
}
