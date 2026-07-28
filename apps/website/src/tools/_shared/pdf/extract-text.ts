import { loadPdfJsDocument } from './pdfjs';

export type PdfPageText = {
    pageIndex: number;
    text: string;
};

export type PdfExtractedText = {
    pages: PdfPageText[];
    fullText: string;
    pageCount: number;
};

export async function extractPdfText(file: File): Promise<PdfExtractedText> {
    const doc = await loadPdfJsDocument(file);
    const pageCount = doc.numPages;
    const pages: PdfPageText[] = [];

    for (let i = 1; i <= pageCount; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        pages.push({ pageIndex: i - 1, text });
    }

    await doc.destroy();

    const fullText = pages.map((p) => p.text).filter(Boolean).join('\n\n');
    return { pages, fullText, pageCount };
}
