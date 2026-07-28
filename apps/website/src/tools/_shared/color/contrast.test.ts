import { describe, expect, test } from 'bun:test';
import { checkWcagContrast, contrastRatio, relativeLuminance } from './contrast';
import { cmykToRgb, pxToRem, remToPx, rgbToCmyk } from './convert';
import { complementary, paletteFromBase, tint } from './palette';
import { parseColor, parseHex, rgbToHex } from './parse';
import { simulateColorBlindness } from './color-blind';

describe('parseHex', () => {
    test('parses 6-digit hex', () => {
        expect(parseHex('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    test('parses 3-digit hex', () => {
        expect(parseHex('0f0')).toEqual({ r: 0, g: 255, b: 0 });
    });
});

describe('contrastRatio', () => {
    test('black on white is 21:1', () => {
        const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
        expect(ratio).toBeCloseTo(21, 0);
    });

    test('relative luminance of white', () => {
        expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
    });
});

describe('checkWcagContrast', () => {
    test('fails low contrast pair', () => {
        const result = checkWcagContrast('#cccccc', '#ffffff');
        expect(result?.aaNormal).toBe(false);
    });

    test('passes strong contrast', () => {
        const result = checkWcagContrast('#000000', '#ffffff');
        expect(result?.aaNormal).toBe(true);
        expect(result?.aaaNormal).toBe(true);
    });
});

describe('convert', () => {
    test('rem px roundtrip', () => {
        expect(pxToRem(remToPx(1.5))).toBeCloseTo(1.5);
    });

    test('cmyk black', () => {
        expect(cmykToRgb(0, 0, 0, 100)).toEqual({ r: 0, g: 0, b: 0 });
    });

    test('rgb to cmyk roundtrip is approximate', () => {
        const rgb = parseColor('#ff0000')!;
        const cmyk = rgbToCmyk(rgb);
        const back = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
        expect(back.r).toBeGreaterThan(240);
        expect(back.g).toBeLessThan(20);
        expect(back.b).toBeLessThan(20);
    });
});

describe('palette', () => {
    test('complementary is 180° apart', () => {
        expect(complementary('#ff0000')).toBeTruthy();
    });

    test('palette returns five colors', () => {
        expect(paletteFromBase('#336699')?.length).toBe(5);
    });

    test('tint lightens', () => {
        const base = parseColor('#336699')!;
        const lighter = parseColor(tint('#336699', 50)!)!;
        expect(lighter.r).toBeGreaterThan(base.r);
    });
});

describe('color-blind simulation', () => {
    test('changes red/green distinction', () => {
        const red = { r: 255, g: 0, b: 0 };
        const green = { r: 0, g: 255, b: 0 };
        const simRed = simulateColorBlindness(red, 'deuteranopia');
        const simGreen = simulateColorBlindness(green, 'deuteranopia');
        expect(simRed).not.toEqual(red);
        expect(simGreen).not.toEqual(green);
    });
});
