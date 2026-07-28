import { describe, expect, test } from 'bun:test';
import {
    defaultsFromFields,
    parseFieldCurrency,
    parseFieldDate,
    parseFieldNumber,
    parseGermanAmount,
} from './parse';
import type { FieldDef } from './types';

describe('defaultsFromFields', () => {
    test('applies defaults and first segment option', () => {
        const fields: FieldDef[] = [
            { id: 'amount', type: 'currency', label: 'Betrag', default: '100' },
            {
                id: 'rate',
                type: 'segment',
                label: 'Satz',
                options: [
                    { value: '19', label: '19 %' },
                    { value: '7', label: '7 %' },
                ],
            },
            { id: 'note', type: 'text', label: 'Notiz' },
        ];
        expect(defaultsFromFields(fields)).toEqual({
            amount: '100',
            rate: '19',
            note: '',
        });
    });
});

describe('parseFieldNumber', () => {
    test('parses German grouping and decimals', () => {
        expect(parseFieldNumber('1.234,56')).toBe(1234.56);
        expect(parseFieldNumber('19')).toBe(19);
        expect(parseFieldNumber('0,07')).toBe(0.07);
    });

    test('returns null for empty or invalid', () => {
        expect(parseFieldNumber('')).toBeNull();
        expect(parseFieldNumber('  ')).toBeNull();
        expect(parseFieldNumber('abc')).toBeNull();
        expect(parseFieldNumber('12,34,56')).toBeNull();
    });

    test('distinguishes zero from empty', () => {
        expect(parseFieldNumber('0')).toBe(0);
        expect(parseFieldNumber('0,00')).toBe(0);
        expect(parseFieldCurrency('')).toBeNull();
    });
});

describe('parseGermanAmount', () => {
    test('empty becomes 0 for lenient paths', () => {
        expect(parseGermanAmount('')).toBe(0);
        expect(parseGermanAmount('12,50')).toBe(12.5);
    });
});

describe('parseFieldDate', () => {
    test('parses valid ISO dates', () => {
        const d = parseFieldDate('2026-07-28');
        expect(d?.getFullYear()).toBe(2026);
        expect(d?.getMonth()).toBe(6);
        expect(d?.getDate()).toBe(28);
    });

    test('rejects invalid dates', () => {
        expect(parseFieldDate('')).toBeNull();
        expect(parseFieldDate('28.07.2026')).toBeNull();
        expect(parseFieldDate('2026-02-31')).toBeNull();
    });
});
