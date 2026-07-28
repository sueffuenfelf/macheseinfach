import { PDFDocument } from 'pdf-lib';
import { describe, expect, test } from 'bun:test';
import { flattenPdf } from './flatten';

async function createPdfWithTextField(): Promise<File> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const form = pdf.getForm();
    const field = form.createTextField('name');
    field.setText('Test');
    field.addToPage(page, { x: 50, y: 500, width: 200, height: 24 });
    const bytes = await pdf.save();
    return new File([bytes], 'form.pdf', { type: 'application/pdf' });
}

describe('flattenPdf', () => {
    test('flattens form fields', async () => {
        const file = await createPdfWithTextField();
        const result = await flattenPdf(file);
        expect(result.fieldCount).toBe(1);
        expect(result.bytes.length).toBeGreaterThan(0);
    });

    test('handles PDF without form', async () => {
        const pdf = await PDFDocument.create();
        pdf.addPage();
        const bytes = await pdf.save();
        const file = new File([bytes], 'plain.pdf', { type: 'application/pdf' });
        const result = await flattenPdf(file);
        expect(result.fieldCount).toBe(0);
        expect(result.bytes.length).toBeGreaterThan(0);
    });
});
