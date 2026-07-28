import { describe, expect, test } from 'bun:test';
import { cmToPx, convertByTable, convertTemperature, dpiFromPxCm, pxToCm } from './convert';
import {
    AREA_TO_SQM,
    FILE_SIZE_TO_BYTES,
    LENGTH_TO_METERS,
    SPEED_TO_KMH,
    VOLUME_TO_LITERS,
    WEIGHT_TO_KG,
} from './factors';
import { decimalToFraction, parseFractionInput } from './fraction';
import { matchPaperFormat, paperPxAtDpi } from './paper';

describe('units/convert', () => {
    test('file size KB to MB', () => {
        const result = convertByTable(1024, 'KB', 'MB', FILE_SIZE_TO_BYTES);
        expect(result).toBe(1);
    });

    test('length cm to inch', () => {
        const result = convertByTable(2.54, 'cm', 'inch', LENGTH_TO_METERS);
        expect(result).toBeCloseTo(1, 5);
    });

    test('weight kg to lb', () => {
        const result = convertByTable(1, 'kg', 'lb', WEIGHT_TO_KG);
        expect(result).toBeCloseTo(2.20462, 4);
    });

    test('temperature c to f', () => {
        expect(convertTemperature(0, 'c', 'f')).toBe(32);
        expect(convertTemperature(100, 'c', 'f')).toBe(212);
    });

    test('speed kmh to mph', () => {
        const result = convertByTable(100, 'kmh', 'mph', SPEED_TO_KMH);
        expect(result).toBeCloseTo(62.1371, 3);
    });

    test('area m2 to ha', () => {
        const result = convertByTable(10_000, 'm2', 'ha', AREA_TO_SQM);
        expect(result).toBe(1);
    });

    test('volume l to gal', () => {
        const result = convertByTable(3.785411784, 'l', 'gal', VOLUME_TO_LITERS);
        expect(result).toBeCloseTo(1, 5);
    });

    test('dpi helpers', () => {
        expect(cmToPx(2.54, 300)).toBeCloseTo(300, 0);
        expect(pxToCm(300, 300)).toBeCloseTo(2.54, 2);
        expect(dpiFromPxCm(300, 2.54)).toBeCloseTo(300, 0);
    });
});

describe('units/fraction', () => {
    test('parse fraction', () => {
        expect(parseFractionInput('3/4')).toBe(0.75);
        expect(parseFractionInput('1 1/2')).toBe(1.5);
    });

    test('decimal to fraction', () => {
        expect(decimalToFraction(0.75)).toBe('3/4');
    });
});

describe('units/paper', () => {
    test('A4 dimensions', () => {
        expect(matchPaperFormat(210, 297)).toBe('A4');
        expect(paperPxAtDpi(210, 300)).toBe(2480);
    });
});
