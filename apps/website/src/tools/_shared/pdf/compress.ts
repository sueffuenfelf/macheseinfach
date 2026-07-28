import { PDFDocument, PDFName, PDFRawStream, type PDFNumber, type PDFRef } from 'pdf-lib';
import {
    clampCompressSettings,
    DEFAULT_COMPRESS_SETTINGS,
    ELSTER_TARGET_BYTES,
    nextCompressSettings,
    resolveCompressStatus,
    type CompressOptions,
    type CompressResult,
    type CompressSettings,
    type CompressStatus,
} from './compress-target';
import { loadPdfJsDocument, renderPdfPage } from './pdfjs';

export {
    DEFAULT_COMPRESS_SETTINGS,
    ELSTER_TARGET_BYTES,
    nextCompressSettings,
    resolveCompressStatus,
    type CompressOptions,
    type CompressResult,
    type CompressSettings,
    type CompressStatus,
} from './compress-target';

function isImageStream(stream: PDFRawStream): boolean {
    const subtype = stream.dict.lookup(PDFName.of('Subtype'));
    return subtype === PDFName.of('Image');
}

function readNumeric(value: unknown): number | undefined {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'asNumber' in value) {
        return (value as PDFNumber).asNumber();
    }
    return undefined;
}

async function decodeImageStreamToCanvas(
    stream: PDFRawStream,
    scale: number,
): Promise<HTMLCanvasElement | null> {
    const width = readNumeric(stream.dict.lookup(PDFName.of('Width')));
    const height = readNumeric(stream.dict.lookup(PDFName.of('Height')));
    if (!width || !height || width <= 0 || height <= 0) return null;

    const filter = stream.dict.lookup(PDFName.of('Filter'));
    const filterName =
        filter === PDFName.of('DCTDecode')
            ? 'jpeg'
            : filter === PDFName.of('FlateDecode')
              ? 'flate'
              : filter === PDFName.of('JPXDecode')
                ? 'jpx'
                : 'unknown';

    const contents = stream.contents;

    try {
        if (filterName === 'jpeg') {
            const blob = new Blob([contents.slice()], { type: 'image/jpeg' });
            const bitmap = await createImageBitmap(blob);
            const targetW = Math.max(1, Math.round(bitmap.width * scale));
            const targetH = Math.max(1, Math.round(bitmap.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                bitmap.close();
                return null;
            }
            ctx.drawImage(bitmap, 0, 0, targetW, targetH);
            bitmap.close();
            return canvas;
        }

        if (filterName === 'flate') {
            const colorSpace = stream.dict.lookup(PDFName.of('ColorSpace'));
            const isRgb =
                colorSpace === PDFName.of('DeviceRGB') ||
                (colorSpace instanceof PDFName && colorSpace.asString() === '/DeviceRGB');
            const bpc = readNumeric(stream.dict.lookup(PDFName.of('BitsPerComponent'))) ?? 8;
            if (!isRgb || bpc !== 8) return null;

            const expected = width * height * 3;
            if (contents.length < expected) return null;

            const canvas = document.createElement('canvas');
            const targetW = Math.max(1, Math.round(width * scale));
            const targetH = Math.max(1, Math.round(height * scale));
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const fullCanvas = document.createElement('canvas');
            fullCanvas.width = width;
            fullCanvas.height = height;
            const fullCtx = fullCanvas.getContext('2d');
            if (!fullCtx) return null;

            const imageData = fullCtx.createImageData(width, height);
            for (let i = 0; i < width * height; i++) {
                imageData.data[i * 4] = contents[i * 3]!;
                imageData.data[i * 4 + 1] = contents[i * 3 + 1]!;
                imageData.data[i * 4 + 2] = contents[i * 3 + 2]!;
                imageData.data[i * 4 + 3] = 255;
            }
            fullCtx.putImageData(imageData, 0, 0);
            ctx.drawImage(fullCanvas, 0, 0, targetW, targetH);
            return canvas;
        }
    } catch {
        return null;
    }

    return null;
}

async function canvasToJpegBytes(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (value) => (value ? resolve(value) : reject(new Error('JPEG encode failed'))),
            'image/jpeg',
            clamp(quality, 0.1, 1),
        );
    });
    return new Uint8Array(await blob.arrayBuffer());
}

async function reencodeEmbeddedImages(
    pdf: PDFDocument,
    settings: CompressSettings,
): Promise<number> {
    let replaced = 0;
    const entries = pdf.context.enumerateIndirectObjects();

    for (const [ref, obj] of entries) {
        if (!(obj instanceof PDFRawStream) || !isImageStream(obj)) continue;

        const canvas = await decodeImageStreamToCanvas(obj, settings.scale);
        if (!canvas) continue;

        try {
            const jpgBytes = await canvasToJpegBytes(canvas, settings.quality);
            obj.dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
            obj.dict.set(PDFName.of('Width'), pdf.context.obj(canvas.width));
            obj.dict.set(PDFName.of('Height'), pdf.context.obj(canvas.height));
            obj.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
            obj.dict.set(PDFName.of('BitsPerComponent'), pdf.context.obj(8));
            obj.dict.delete(PDFName.of('DecodeParms'));
            obj.dict.delete(PDFName.of('SMask'));
            pdf.context.assign(ref as PDFRef, PDFRawStream.of(obj.dict, jpgBytes));
            replaced += 1;
        } catch {
            // skip images we cannot re-encode
        }
    }

    return replaced;
}

async function rasterizePdf(file: File, settings: CompressSettings): Promise<Uint8Array> {
    const sourcePdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const jsDoc = await loadPdfJsDocument(file);
    const output = await PDFDocument.create();
    const renderScale = Math.max(0.5, settings.scale * RENDER_DPI_SCALE);

    for (let pageIndex = 0; pageIndex < sourcePdf.getPageCount(); pageIndex++) {
        const sourcePage = sourcePdf.getPage(pageIndex);
        const { width, height } = sourcePage.getSize();
        const rendered = await renderPdfPage(jsDoc, pageIndex, renderScale);
        const jpgBytes = await canvasToJpegBytes(rendered.canvas, settings.quality);
        const embedded = await output.embedJpg(jpgBytes);
        const page = output.addPage([width, height]);
        page.drawImage(embedded, { x: 0, y: 0, width, height });
    }

    return output.save({ useObjectStreams: true });
}

const RENDER_DPI_SCALE = 1.5;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

async function compressOnce(
    file: File,
    settings: CompressSettings,
    forceRaster: boolean,
): Promise<{ bytes: Uint8Array; compressedSize: number; imagesReencoded: number }> {
    if (forceRaster) {
        const bytes = await rasterizePdf(file, settings);
        return { bytes, compressedSize: bytes.length, imagesReencoded: 0 };
    }

    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const imagesReencoded = await reencodeEmbeddedImages(pdf, settings);
    let bytes = await pdf.save({ useObjectStreams: true });

    if (imagesReencoded === 0) {
        bytes = await rasterizePdf(file, settings);
    }

    return { bytes, compressedSize: bytes.length, imagesReencoded };
}

export async function compressPdfWithSettings(
    file: File,
    settings: CompressSettings,
): Promise<{ bytes: Uint8Array; compressedSize: number; imagesReencoded: number }> {
    return compressOnce(file, settings, false);
}

type FitAttempt = {
    settings: CompressSettings;
    bytes: Uint8Array;
    compressedSize: number;
    atFloor: boolean;
};

async function fitCompressToTarget(
    file: File,
    targetBytes: number,
    startSettings: CompressSettings,
    autoFit: boolean,
): Promise<FitAttempt> {
    let settings: CompressSettings = clampCompressSettings(startSettings);

    let lastBytes: Uint8Array = new Uint8Array();
    let lastSize = file.size;
    let atFloor = false;
    let useRaster = false;

    for (let attempt = 0; attempt < 12; attempt++) {
        const { bytes, compressedSize } = await compressOnce(file, settings, useRaster);
        lastBytes = bytes;
        lastSize = compressedSize;

        if (compressedSize <= targetBytes) {
            return { settings, bytes, compressedSize, atFloor: false };
        }

        if (!autoFit) break;

        const next = nextCompressSettings(settings);
        if (!next) {
            if (!useRaster) {
                useRaster = true;
                settings = clampCompressSettings(startSettings);
                continue;
            }
            atFloor = true;
            break;
        }
        settings = next;
    }

    return { settings, bytes: lastBytes, compressedSize: lastSize, atFloor };
}

/** Find quality/scale that fit under `targetBytes` — used for live slider updates. */
export async function findCompressSettingsForTarget(
    file: File,
    targetBytes: number,
    startSettings: CompressSettings = DEFAULT_COMPRESS_SETTINGS,
): Promise<{
    settings: CompressSettings;
    compressedSize: number;
    status: CompressStatus;
}> {
    const fit = await fitCompressToTarget(file, targetBytes, startSettings, true);
    return {
        settings: fit.settings,
        compressedSize: fit.compressedSize,
        status: resolveCompressStatus(fit.compressedSize, targetBytes, fit.atFloor),
    };
}

export async function compressPdfToTarget(
    file: File,
    options: CompressOptions,
): Promise<CompressResult> {
    const originalSize = file.size;
    const fit = await fitCompressToTarget(
        file,
        options.targetBytes,
        { quality: options.quality, scale: options.scale },
        options.autoFit ?? false,
    );

    return {
        bytes: fit.bytes,
        originalSize,
        compressedSize: fit.compressedSize,
        settings: fit.settings,
        status:
            fit.compressedSize <= options.targetBytes
                ? 'under_limit'
                : resolveCompressStatus(fit.compressedSize, options.targetBytes, fit.atFloor),
    };
}

/** Preview-only — no auto-fit loop */
export async function previewCompressSize(file: File, settings: CompressSettings): Promise<number> {
    const { compressedSize } = await compressPdfWithSettings(file, settings);
    return compressedSize;
}
