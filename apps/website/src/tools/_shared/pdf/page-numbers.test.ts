import { PDFDocument } from 'pdf-lib';
import { describe, expect, test } from 'bun:test';
import { addPdfPageNumbers } from './page-numbers';

describe('addPdfPageNumbers', () => {
    test('adds numbers to multi-page PDF', async () => {
        const pdf = await PDFDocument.create();
        pdf.addPage();
        pdf.addPage();
        const bytes = await pdf.save();
        const file = new File([bytes], 'doc.pdf', { type: 'application/pdf' });

        const result = await addPdfPageNumbers(file, { startAt: 1, position: 'bottom-center' });
        expect(result.length).toBeGreaterThan(bytes.length);

        const reloaded = await PDFDocument.load(result);
        expect(reloaded.getPageCount()).toBe(2);
    });
});
