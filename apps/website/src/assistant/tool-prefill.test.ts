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
        setToolFilePrefill('hash-file', file);
        expect(consumeToolFilePrefill('hash-file')).toBe(file);
        expect(consumeToolFilePrefill('hash-file')).toBeNull();
    });

    test('scalar prefill merges into field defaults', () => {
        const fields: FieldDef[] = [
            { id: 'cold', type: 'currency', label: 'Kaltmiete', placeholder: '0' },
        ];
        setToolScalarPrefill('deposit-calc', { cold: '900' });
        const values = fieldDefaultsWithPrefill('deposit-calc', fields);
        expect(values.cold).toBe('900');
        expect(fieldDefaultsWithPrefill('deposit-calc', fields).cold).not.toBe('900');
    });
});
