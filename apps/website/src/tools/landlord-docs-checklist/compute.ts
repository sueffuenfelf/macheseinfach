import type { FieldValues, GenerateOutput } from '../_shared/shells';

const DOCS = [
    'Personalausweis / Reisepass (Kopie)',
    'Einkommensnachweise (letzte 2–3 Monate)',
    'Arbeitsvertrag oder Selbstständigen-Nachweis',
    'Schufa-Auskunft (aktuell)',
    'Mietschuldenfreiheitsbescheinigung (vorheriger Vermieter)',
    'Nachweis Mietkaution / Bürgschaft (falls gefordert)',
    'Meldebescheinigung / bisherige Anschrift',
    'Nachweise zu Bürgschaftsperson (falls nötig)',
    'Haustier-Nachweis / Zustimmung (falls relevant)',
    'Selbstauskunft / Bewerbungsbogen des Vermieters',
];

/** Generate landlord documents checklist. */
export function generateLandlordDocsChecklist(values: FieldValues): GenerateOutput {
    const role = values.role ?? 'tenant';
    const intro =
        role === 'tenant'
            ? 'Typische Unterlagen, die Vermieter:innen oft verlangen:'
            : 'Checkliste für Vermieter:innen — was Mieter:innen oft einreichen:';
    const lines = [
        'Vermieter-Unterlagen — Checkliste',
        intro,
        '',
        ...DOCS.map((item, i) => `[ ] ${i + 1}. ${item}`),
        '',
        'Hinweis: Keine Rechtsberatung — Anforderungen variieren. Nur anfordern, was erlaubt und nötig ist.',
    ];
    return {
        kind: 'text',
        content: lines.join('\n'),
        filename: 'vermieter-unterlagen.txt',
    };
}
