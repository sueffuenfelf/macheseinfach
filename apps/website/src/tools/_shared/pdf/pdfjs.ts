import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export type PdfPageRender = {
    pageIndex: number;
    width: number;
    height: number;
    canvas: HTMLCanvasElement;
};

export async function loadPdfJsDocument(
    file: File,
    password?: string,
): Promise<pdfjs.PDFDocumentProxy> {
    const data = new Uint8Array(await file.arrayBuffer());
    return pdfjs.getDocument({
        data,
        ...(password ? { password } : {}),
    }).promise;
}

export async function renderPdfPage(
    doc: pdfjs.PDFDocumentProxy,
    pageIndex: number,
    scale = 1,
): Promise<PdfPageRender> {
    const page = await doc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    return {
        pageIndex,
        width: viewport.width,
        height: viewport.height,
        canvas,
    };
}

export async function renderPdfPageToDataUrl(
    doc: pdfjs.PDFDocumentProxy,
    pageIndex: number,
    scale: number,
): Promise<string> {
    const rendered = await renderPdfPage(doc, pageIndex, scale);
    return rendered.canvas.toDataURL('image/png');
}
