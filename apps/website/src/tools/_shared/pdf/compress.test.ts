import { describe, expect, test } from 'bun:test';
import {
    DEFAULT_COMPRESS_SETTINGS,
    ELSTER_TARGET_BYTES,
    nextCompressSettings,
    resolveCompressStatus,
} from './compress-target';

describe('pdf compress helpers', () => {
    test('resolveCompressStatus under limit', () => {
        expect(resolveCompressStatus(500_000, ELSTER_TARGET_BYTES, false)).toBe('under_limit');
    });

    test('resolveCompressStatus over limit', () => {
        expect(resolveCompressStatus(3_000_000, ELSTER_TARGET_BYTES, false)).toBe('over_limit');
    });

    test('resolveCompressStatus unreachable at floor', () => {
        expect(resolveCompressStatus(3_000_000, ELSTER_TARGET_BYTES, true)).toBe(
            'limit_unreachable',
        );
    });

    test('nextCompressSettings lowers quality first', () => {
        const next = nextCompressSettings({ quality: 0.75, scale: 1 });
        expect(next?.quality).toBeLessThan(0.75);
        expect(next?.scale).toBe(1);
    });

    test('nextCompressSettings lowers scale after quality floor', () => {
        const next = nextCompressSettings({ quality: 0.35, scale: 1 });
        expect(next?.quality).toBe(0.35);
        expect(next?.scale).toBeLessThan(1);
    });

    test('nextCompressSettings returns null at floor', () => {
        expect(nextCompressSettings({ quality: 0.35, scale: 0.45 })).toBeNull();
    });

    test('default settings are prefilled sensibly', () => {
        expect(DEFAULT_COMPRESS_SETTINGS.quality).toBe(0.75);
        expect(DEFAULT_COMPRESS_SETTINGS.scale).toBe(1);
    });
});
