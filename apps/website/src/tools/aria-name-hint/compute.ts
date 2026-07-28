import type { FieldValues, GenerateOutput } from '../_shared/shells';

const ITEMS = [
    'Icon-Buttons: aria-label oder sichtbarer Text',
    'Eingabefelder: <label for="id"> oder aria-labelledby',
    'Bilder mit Funktion: alt-Text als Name',
    'Custom Controls: role + aria-* wo nötig',
    'Kein aria-label wenn sichtbarer Text vorhanden (Redundanz vermeiden)',
    'aria-hidden="true" nur für rein dekorative Elemente',
];

export function generateAriaNameHint(_values: FieldValues): GenerateOutput {
    const lines = [
        '# Zugänglicher Name (Accessible Name) — Checkliste',
        '',
        ...ITEMS.map((item, i) => `${i + 1}. [ ] ${item}`),
        '',
        'Prüfen: DevTools → Accessibility → Name berechnet aus?',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'aria-name-checkliste.md' };
}
