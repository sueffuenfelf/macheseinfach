import { PDFDocument } from 'pdf-lib';
import { describe, expect, test } from 'bun:test';
import { addPdfWatermark } from './watermark';

describe('addPdfWatermark', () => {
    test('adds watermark text', async () => {
        const pdf = await PDFDocument.create();
        pdf.addPage();
        const bytes = await pdf.save();
        const file = new File([bytes], 'doc.pdf', { type: 'application/pdf' });

        const result = await addPdfWatermark(file, 'ENTWURF');
        expect(result.length).toBeGreaterThan(0);
    });

    test('rejects empty watermark', async () => {
        const pdf = await PDFDocument.create();
        pdf.addPage();
        const bytes = await pdf.save();
        const file = new File([bytes], 'doc.pdf', { type: 'application/pdf' });

        await expect(addPdfWatermark(file, '   ')).rejects.toThrow('Wasserzeichen-Text');
    });
});
