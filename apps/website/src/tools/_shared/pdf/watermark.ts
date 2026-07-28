import { degrees, rgb } from 'pdf-lib';
import { loadPdfDocument } from './io';

export type WatermarkOptions = {
    opacity?: number;
    fontSize?: number;
    rotation?: number;
};

export async function addPdfWatermark(
    file: File,
    text: string,
    options: WatermarkOptions = {},
): Promise<Uint8Array> {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Wasserzeichen-Text darf nicht leer sein.');

    const pdf = await loadPdfDocument(file);
    const fontSize = options.fontSize ?? 48;
    const opacity = options.opacity ?? 0.15;
    const rotation = options.rotation ?? -45;
    const font = await pdf.embedFont('Helvetica-Bold');

    for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(trimmed, fontSize);
        const x = (width - textWidth) / 2;
        const y = height / 2;

        page.drawText(trimmed, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.5, 0.5, 0.5),
            opacity,
            rotate: degrees(rotation),
        });
    }

    return pdf.save({ useObjectStreams: true });
}
