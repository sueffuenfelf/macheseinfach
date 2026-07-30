import { describe, expect, test } from 'bun:test';
import { areaOrder, areas } from '../data/catalog';
import { areaCardTextColors } from './areaCardText';
import { checkWcagContrast } from '../tools/_shared/color/contrast';

describe('areaCardTextColors', () => {
    test('every area accent yields AA-large contrast for title and description', () => {
        for (const id of areaOrder) {
            const accent = areas[id].accent;
            const { title, description } = areaCardTextColors(accent);

            const titleCheck = checkWcagContrast(title, accent);
            const descCheck = checkWcagContrast(description, accent);

            expect(titleCheck?.aaLarge, `${id} title on ${accent}`).toBe(true);
            expect(descCheck?.aaLarge, `${id} description on ${accent}`).toBe(true);
        }
    });

    test('dark accents use light text', () => {
        expect(areaCardTextColors('#264653').title).toBe('#ffffff');
        expect(areaCardTextColors('#457b9d').title).toBe('#ffffff');
    });

    test('light accents use dark text', () => {
        expect(areaCardTextColors('#ffc900').title).toBe('#000000');
        expect(areaCardTextColors('#ff90e8').title).toBe('#000000');
    });
});
