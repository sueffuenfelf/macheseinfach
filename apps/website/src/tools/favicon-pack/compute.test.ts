import { describe, expect, test } from 'bun:test';
import { faviconFilename } from './compute';

describe('favicon-pack', () => {
    test('apple touch icon name', () => {
        expect(faviconFilename(180)).toBe('apple-touch-icon.png');
    });

    test('standard size name', () => {
        expect(faviconFilename(32)).toBe('favicon-32x32.png');
    });
});
