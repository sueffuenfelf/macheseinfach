import { describe, expect, test } from 'bun:test';
import {
    brightnessContrastFilter,
    clampAdjustValue,
    isNeutralAdjust,
} from './adjust-filters';
import {
    clampCropRect,
    cropNaturalSize,
    cropRectWithAspect,
    FULL_CROP,
    isFullCrop,
} from './crop-rect';
import { checkImageDpi, effectiveDpi, formatFileSize } from './dpi';
import {
    checkPassportDimensions,
    defaultPassportCrop,
    PASSPORT_ASPECT,
    passportPixelSize,
} from './passport';
import { watermarkAnchor } from './watermark-position';

describe('crop helpers', () => {
    test('isFullCrop detects unit rect', () => {
        expect(isFullCrop(FULL_CROP)).toBe(true);
        expect(isFullCrop({ x: 0.1, y: 0.1, width: 0.5, height: 0.5 })).toBe(false);
    });

    test('clampCropRect keeps rect inside bounds', () => {
        expect(clampCropRect({ x: 0.9, y: 0.9, width: 0.5, height: 0.5 })).toEqual({
            x: 0.5,
            y: 0.5,
            width: 0.5,
            height: 0.5,
        });
    });

    test('cropNaturalSize rounds pixel dimensions', () => {
        expect(cropNaturalSize({ x: 0, y: 0, width: 0.5, height: 0.25 }, 2000, 1000)).toEqual({
            width: 1000,
            height: 250,
        });
    });

    test('cropRectWithAspect enforces ratio', () => {
        const rect = cropRectWithAspect(
            { x: 0, y: 0, width: 1, height: 1 },
            PASSPORT_ASPECT,
            'center',
        );
        expect(rect.width / rect.height).toBeCloseTo(PASSPORT_ASPECT, 2);
    });
});

describe('adjust helpers', () => {
    test('clampAdjustValue limits range', () => {
        expect(clampAdjustValue(150)).toBe(100);
        expect(clampAdjustValue(-200)).toBe(-100);
    });

    test('brightnessContrastFilter uses percent syntax', () => {
        expect(brightnessContrastFilter({ brightness: 10, contrast: -5 })).toBe(
            'brightness(110%) contrast(95%)',
        );
    });

    test('isNeutralAdjust', () => {
        expect(isNeutralAdjust({ brightness: 0, contrast: 0 })).toBe(true);
        expect(isNeutralAdjust({ brightness: 1, contrast: 0 })).toBe(false);
    });
});

describe('passport helpers', () => {
    test('passportPixelSize at 300 DPI', () => {
        const size = passportPixelSize(300);
        expect(size.width).toBe(413);
        expect(size.height).toBe(531);
    });

    test('checkPassportDimensions accepts exact size', () => {
        const size = passportPixelSize(300);
        const result = checkPassportDimensions(size.width, size.height, 300);
        expect(result.ok).toBe(true);
    });

    test('defaultPassportCrop keeps aspect', () => {
        const rect = defaultPassportCrop(4000, 3000);
        const w = rect.width * 4000;
        const h = rect.height * 3000;
        expect(w / h).toBeCloseTo(PASSPORT_ASPECT, 2);
    });
});

describe('dpi helpers', () => {
    test('effectiveDpi for A4 width', () => {
        expect(Math.round(effectiveDpi(2480, 21))).toBe(300);
    });

    test('formatFileSize', () => {
        expect(formatFileSize(512)).toBe('512 B');
        expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    test('checkImageDpi reports dimensions', () => {
        const result = checkImageDpi({ widthPx: 2480, heightPx: 3508, assumedDpi: 300 });
        expect(result.details.some((d) => d.label === 'Pixel')).toBe(true);
        expect(result.ok).toBe(true);
    });
});

describe('watermarkAnchor', () => {
    test('bottom-right places text with padding', () => {
        const { x, y } = watermarkAnchor('bottom-right', 1000, 800, 200, 40, 20);
        expect(x).toBe(780);
        expect(y).toBe(780);
    });
});
