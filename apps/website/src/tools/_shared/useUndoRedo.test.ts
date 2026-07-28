import { describe, expect, test } from 'bun:test';
import { isModKey } from './useUndoRedo';

describe('useUndoRedo helpers', () => {
    test('isModKey respects meta and ctrl', () => {
        expect(isModKey({ metaKey: true, ctrlKey: false } as KeyboardEvent)).toBe(true);
        expect(isModKey({ metaKey: false, ctrlKey: true } as KeyboardEvent)).toBe(true);
        expect(isModKey({ metaKey: false, ctrlKey: false } as KeyboardEvent)).toBe(false);
    });
});
