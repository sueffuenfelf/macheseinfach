import type { CalcResult, FieldValues } from '../_shared/shells';
import { complementary } from '../_shared/color';

export function computeComplementary(values: FieldValues): CalcResult {
    const input = (values.color ?? '').trim();
    if (!input) return { rows: [], error: 'Basisfarbe eingeben.' };
    const comp = complementary(input);
    if (!comp) return { rows: [], error: 'Ungültige Farbe.' };
    return {
        rows: [
            { label: 'Basis', value: input },
            { label: 'Komplementär', value: comp },
        ],
        hint: 'Gegenüberliegende Farbe im Farbkreis (180°) — gut für Akzente und Buttons.',
    };
}
