import { PDFDocument } from 'pdf-lib';
import { formatFromBlob } from './canvas';
import { convertImage } from './convert';
import type { ImageFormatId } from './types';

function isPng(blob: Blob, filename: string): boolean {
    if (blob.type.includes('png')) return true;
    return filename.toLowerCase().endsWith('.png');
}

async function embedImage(pdf: PDFDocument, blob: Blob, filename: string) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (isPng(blob, filename)) {
        return pdf.embedPng(bytes);
    }
    return pdf.embedJpg(bytes);
}

async function prepareImageBlob(file: File): Promise<Blob> {
    const format = formatFromBlob(file, file.name);
    if (format === 'heic') {
        return convertImage(file, 'heic', 'jpg');
    }
    if (format === 'webp') {
        return convertImage(file, 'webp', 'jpg');
    }
    if (format === 'png') return file;
    if (format === 'jpg') return file;
    return convertImage(file, format as ImageFormatId, 'jpg');
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();

    for (const file of files) {
        const blob = await prepareImageBlob(file);
        const image = await embedImage(pdf, blob, file.name);
        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return pdf.save({ useObjectStreams: true });
}

export function imagesPdfFilename(firstName: string): string {
    const base = firstName.replace(/\.[^.]+$/, '') || 'bilder';
    return `${base}-zusammen.pdf`;
}
