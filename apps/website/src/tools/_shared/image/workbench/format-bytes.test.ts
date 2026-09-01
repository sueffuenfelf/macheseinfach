import { describe, expect, test } from 'bun:test';
import { formatBytes } from './format-bytes';

describe('formatBytes', () => {
    test('formats common sizes', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(2048)).toBe('2.0 KB');
        expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    });
});
