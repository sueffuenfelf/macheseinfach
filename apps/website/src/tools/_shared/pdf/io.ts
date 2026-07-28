import { PDFDocument } from 'pdf-lib';

export async function loadPdfDocument(file: File): Promise<PDFDocument> {
    const bytes = await file.arrayBuffer();
    return PDFDocument.load(bytes, { ignoreEncryption: true });
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
    const blob = new Blob([bytes.slice()], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Sequential downloads (browsers block parallel `download` clicks). */
export async function downloadBlobsSequential(
    items: { blob: Blob; filename: string }[],
    gapMs = 250,
): Promise<void> {
    for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        downloadBlob(item.blob, item.filename);
        if (i < items.length - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, gapMs));
        }
    }
}

export async function mergePdfFiles(files: File[]): Promise<Uint8Array> {
    const merged = await PDFDocument.create();
    for (const file of files) {
        const pdf = await loadPdfDocument(file);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        for (const page of pages) merged.addPage(page);
    }
    return merged.save({ useObjectStreams: true });
}

export function swapBaseFilename(name: string, suffix: string): string {
    const base = name.replace(/\.pdf$/i, '') || 'dokument';
    return `${base}${suffix}.pdf`;
}
