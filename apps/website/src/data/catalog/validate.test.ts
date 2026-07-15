import { describe, expect, test } from 'bun:test';
import { tools } from '../../tools/discover';
import { assertCatalogValid, validateCatalog } from './validate';

const hasDiscoveredTools = Object.keys(tools).length > 0;

describe('catalog', () => {
    test('validateCatalog() is ok', () => {
        if (!hasDiscoveredTools) {
            console.warn('Skipping catalog validation — requires Vite (import.meta.glob)');
            return;
        }
        const result = validateCatalog();
        expect(result.ok).toBe(true);
        if (!result.ok) {
            console.error(result.issues);
        }
    });

    test('assertCatalogValid() does not throw', () => {
        if (!hasDiscoveredTools) {
            console.warn('Skipping catalog validation — requires Vite (import.meta.glob)');
            return;
        }
        expect(() => assertCatalogValid()).not.toThrow();
    });
});
