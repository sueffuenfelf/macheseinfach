import { rgb } from 'pdf-lib';
import { loadPdfDocument } from './io';

export type PageNumberPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';

export type PageNumberOptions = {
    startAt?: number;
    position?: PageNumberPosition;
    fontSize?: number;
};

const MARGIN = 24;

function positionCoords(
    position: PageNumberPosition,
    width: number,
    height: number,
    textWidth: number,
): { x: number; y: number } {
    const y = MARGIN;
    switch (position) {
        case 'bottom-left':
            return { x: MARGIN, y };
        case 'bottom-center':
            return { x: (width - textWidth) / 2, y };
        case 'bottom-right':
            return { x: width - textWidth - MARGIN, y };
    }
}

export async function addPdfPageNumbers(
    file: File,
    options: PageNumberOptions = {},
): Promise<Uint8Array> {
    const pdf = await loadPdfDocument(file);
    const startAt = options.startAt ?? 1;
    const position = options.position ?? 'bottom-center';
    const fontSize = options.fontSize ?? 10;
    const font = await pdf.embedFont('Helvetica');

    const pages = pdf.getPages();
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        const label = String(startAt + i);
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const { x, y } = positionCoords(position, width, 0, textWidth);

        page.drawText(label, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(0.35, 0.35, 0.35),
        });
    }

    return pdf.save({ useObjectStreams: true });
}
