import { describe, expect, test } from 'bun:test';
import { assertCatalogValid, validateCatalog } from './validate';

describe('catalog', () => {
    test('validateCatalog() is ok', () => {
        const result = validateCatalog();
        expect(result.ok).toBe(true);
        if (!result.ok) {
            console.error(result.issues);
        }
    });

    test('assertCatalogValid() does not throw', () => {
        expect(() => assertCatalogValid()).not.toThrow();
    });
});
