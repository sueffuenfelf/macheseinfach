import { listPdfFormFields } from './form-fill';
import { loadPdfDocument } from './io';

export type FlattenPdfResult = {
    bytes: Uint8Array;
    fieldCount: number;
};

export async function flattenPdf(file: File): Promise<FlattenPdfResult> {
    const pdf = await loadPdfDocument(file);
    const fields = listPdfFormFields(pdf);

    if (fields.length > 0) {
        pdf.getForm().flatten();
    }

    const bytes = await pdf.save({ useObjectStreams: true });
    return { bytes, fieldCount: fields.length };
}
