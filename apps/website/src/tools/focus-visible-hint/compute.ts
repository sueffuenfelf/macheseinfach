import type { FieldValues, GenerateOutput } from '../_shared/shells';

const ITEMS = [
    'Alle interaktiven Elemente per Tastatur erreichbar (Tab-Reihenfolge logisch)',
    'Fokus sichtbar: outline oder box-shadow — nicht outline: none ohne Ersatz',
    ':focus-visible nutzen, damit Maus-Nutzer keinen Ring sehen müssen',
    'Skip-Link zum Hauptinhalt (erster Tab-Stopp)',
    'Keine Keyboard-Traps in Modals ohne Escape-Schließen',
    'Kontrast des Fokus-Rings zum Hintergrund prüfen (min. 3:1)',
];

export function generateFocusVisibleHint(values: FieldValues): GenerateOutput {
    const scope = values.scope ?? 'website';
    const lines = [
        `# Fokus & Tastatur — Checkliste (${scope === 'component' ? 'Komponente' : 'Website'})`,
        '',
        ...ITEMS.map((item, i) => `${i + 1}. [ ] ${item}`),
        '',
        'CSS-Beispiel:',
        '```css',
        ':focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }',
        '```',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'focus-checkliste.md' };
}
