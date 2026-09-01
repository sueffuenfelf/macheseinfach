import { describe, expect, test } from 'bun:test';
import {
    consumeToolFilePrefill,
    setToolFilePrefill,
    setToolScalarPrefill,
    fieldDefaultsWithPrefill,
} from './tool-prefill';
import type { FieldDef } from '../tools/_shared/shells/types';

describe('tool-prefill', () => {
    test('file prefill is consumed once', () => {
        const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
        setToolFilePrefill('ocr-local', file);
        expect(consumeToolFilePrefill('ocr-local')).toBe(file);
        expect(consumeToolFilePrefill('ocr-local')).toBeNull();
    });

    test('scalar prefill merges into field defaults', () => {
        const fields: FieldDef[] = [
            { id: 'a', type: 'number', label: 'A', placeholder: '0' },
        ];
        setToolScalarPrefill('percent-calc', { a: '10' });
        const values = fieldDefaultsWithPrefill('percent-calc', fields);
        expect(values.a).toBe('10');
        expect(fieldDefaultsWithPrefill('percent-calc', fields).a).not.toBe('10');
    });
});
