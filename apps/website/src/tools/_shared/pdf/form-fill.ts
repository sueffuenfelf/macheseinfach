import {
    PDFCheckBox,
    PDFDropdown,
    PDFRadioGroup,
    PDFTextField,
    type PDFField,
    type PDFDocument,
} from 'pdf-lib';
import { loadPdfDocument } from './io';

export type FormFieldKind = 'text' | 'checkbox' | 'dropdown' | 'radio' | 'other';

export type FormFieldDescriptor = {
    name: string;
    kind: FormFieldKind;
    options?: string[];
    value?: string | boolean;
};

function fieldKind(field: PDFField): FormFieldKind {
    if (field instanceof PDFTextField) return 'text';
    if (field instanceof PDFCheckBox) return 'checkbox';
    if (field instanceof PDFDropdown) return 'dropdown';
    if (field instanceof PDFRadioGroup) return 'radio';
    return 'other';
}

function readFieldValue(field: PDFField): string | boolean | undefined {
    if (field instanceof PDFTextField) return field.getText() ?? '';
    if (field instanceof PDFCheckBox) return field.isChecked();
    if (field instanceof PDFDropdown) return field.getSelected()?.[0] ?? '';
    if (field instanceof PDFRadioGroup) return field.getSelected() ?? '';
    return undefined;
}

export function listPdfFormFields(pdf: PDFDocument): FormFieldDescriptor[] {
    let form: ReturnType<PDFDocument['getForm']>;
    try {
        form = pdf.getForm();
    } catch {
        return [];
    }

    return form.getFields().map((field) => {
        const kind = fieldKind(field);
        const descriptor: FormFieldDescriptor = {
            name: field.getName(),
            kind,
            value: readFieldValue(field),
        };

        if (field instanceof PDFDropdown) {
            descriptor.options = field.getOptions();
        }
        if (field instanceof PDFRadioGroup) {
            descriptor.options = field.getOptions();
        }

        return descriptor;
    });
}

export async function loadPdfFormFields(file: File): Promise<FormFieldDescriptor[]> {
    const pdf = await loadPdfDocument(file);
    return listPdfFormFields(pdf);
}

export function applyFormFieldValues(
    pdf: PDFDocument,
    values: Record<string, string | boolean>,
): void {
    const form = pdf.getForm();
    for (const field of form.getFields()) {
        const name = field.getName();
        const value = values[name];
        if (value === undefined) continue;

        if (field instanceof PDFTextField && typeof value === 'string') {
            field.setText(value);
        } else if (field instanceof PDFCheckBox && typeof value === 'boolean') {
            if (value) field.check();
            else field.uncheck();
        } else if (field instanceof PDFDropdown && typeof value === 'string') {
            if (field.getOptions().includes(value)) field.select(value);
        } else if (field instanceof PDFRadioGroup && typeof value === 'string') {
            if (field.getOptions().includes(value)) field.select(value);
        }
    }
}

export async function exportFilledPdf(
    file: File,
    values: Record<string, string | boolean>,
    flatten: boolean,
): Promise<Uint8Array> {
    const pdf = await loadPdfDocument(file);
    applyFormFieldValues(pdf, values);
    if (flatten) {
        pdf.getForm().flatten();
    }
    return pdf.save({ useObjectStreams: true });
}
