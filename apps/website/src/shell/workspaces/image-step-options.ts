import type { ImageFormatId } from '../../tools/_shared/image/types';

export type WidgetImageStepKind = 'convert' | 'compress' | 'resize' | 'exif-strip';

export type WidgetImageStepOptions = {
    kind: WidgetImageStepKind;
    convertTo?: ImageFormatId;
    /** 1–100 for UI; widget converts to 0–1. */
    compressQuality?: number;
    compressFormat?: ImageFormatId;
    resizeMaxWidth?: number;
    resizeMaxHeight?: number;
    resizeFormat?: ImageFormatId;
    exifFormat?: ImageFormatId;
};

export const DEFAULT_WIDGET_IMAGE_STEP_OPTIONS: Record<
    WidgetImageStepKind,
    WidgetImageStepOptions
> = {
    convert: { kind: 'convert', convertTo: 'jpg' },
    compress: { kind: 'compress', compressQuality: 82, compressFormat: 'jpg' },
    resize: {
        kind: 'resize',
        resizeMaxWidth: 1920,
        resizeMaxHeight: 1920,
        resizeFormat: 'jpg',
    },
    'exif-strip': { kind: 'exif-strip', exifFormat: 'jpg' },
};

export function resolveImageStepOptions(
    kind: WidgetImageStepKind,
    value?: Partial<WidgetImageStepOptions>,
): WidgetImageStepOptions {
    const defaults = DEFAULT_WIDGET_IMAGE_STEP_OPTIONS[kind];
    const merged = { ...defaults, ...value, kind };
    if (kind === 'convert') {
        const { convertFrom: _legacy, ...convert } = merged as WidgetImageStepOptions & {
            convertFrom?: ImageFormatId;
        };
        return convert;
    }
    return merged;
}
