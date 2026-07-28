import { extractPdfText } from './extract-text';

export type PdfPageCompare = {
    pageIndex: number;
    aText: string;
    bText: string;
    identical: boolean;
};

export type PdfCompareResult = {
    aPages: number;
    bPages: number;
    pageCountMatch: boolean;
    comparedPages: number;
    identicalPages: number;
    pages: PdfPageCompare[];
};

export async function comparePdfs(fileA: File, fileB: File): Promise<PdfCompareResult> {
    const [a, b] = await Promise.all([extractPdfText(fileA), extractPdfText(fileB)]);
    const comparedPages = Math.max(a.pageCount, b.pageCount);
    const pages: PdfPageCompare[] = [];

    for (let i = 0; i < comparedPages; i++) {
        const aText = a.pages[i]?.text ?? '';
        const bText = b.pages[i]?.text ?? '';
        pages.push({
            pageIndex: i,
            aText,
            bText,
            identical: aText === bText,
        });
    }

    const identicalPages = pages.filter((p) => p.identical).length;

    return {
        aPages: a.pageCount,
        bPages: b.pageCount,
        pageCountMatch: a.pageCount === b.pageCount,
        comparedPages,
        identicalPages,
        pages,
    };
}
