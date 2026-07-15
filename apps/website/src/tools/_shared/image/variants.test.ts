import { describe, expect, test } from 'bun:test';
import { getFormat, liveTargetFormats } from './formats';
import { buildConversionVariants } from './variants';

describe('image variants', () => {
    test('buildConversionVariants generates unique slugs', () => {
        const variants = buildConversionVariants();
        expect(variants.length).toBe(8);
        const slugs = new Set(variants.map((variant) => variant.slug));
        expect(slugs.size).toBe(variants.length);
    });

    test('heic variants target jpg and png', () => {
        const variants = buildConversionVariants();
        const heicTargets = variants.filter((variant) => variant.params.from === 'heic').map((variant) => variant.params.to);
        expect(heicTargets).toContain('jpg');
        expect(heicTargets).toContain('png');
    });

    test('liveTargetFormats lists live targets per format', () => {
        for (const id of ['heic', 'png', 'jpg', 'webp'] as const) {
            const targets = liveTargetFormats(id);
            expect(targets.length).toBeGreaterThan(0);
            for (const target of targets) {
                expect(getFormat(target).status).toBe('live');
            }
        }
    });
});
