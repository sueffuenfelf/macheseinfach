import type { FieldValues, GenerateOutput } from '../_shared/shells';

const GENERAL = [
    'Ort und Datum der Ausstellung',
    'Vollständiger Name und Anschrift des/der Vollmachtgeber:in',
    'Vollständiger Name und Anschrift des/der Bevollmächtigten',
    'Klare Formulierung: „Vollmacht“ / „ermächtige hiermit …"',
    'Umfang der Befugnis (allgemein oder konkret beschrieben)',
    'Gültigkeitsdauer (befristet oder unbefristet)',
    'Unterschrift des/der Vollmachtgeber:in (handschriftlich bei Original)',
    'Optional: Beglaubigung oder notarielle Beurkundung (bei Grundbuch etc.)',
];

const SPECIFIC = [
    ...GENERAL.slice(0, 4),
    'Konkrete Handlung oder Vorgang benennen (z. B. „Fahrzeugabmeldung", „Paketannahme")',
    'Ggf. Aktenzeichen, Kfz-Kennzeichen, Vertragsnummer',
    'Keine weitergehende Generalvollmacht andeuten',
    ...GENERAL.slice(4),
];

const PROKURA = [
    'Firma und Sitz des Unternehmens',
    'Handelsregistereintrag',
    'Name des/der Prokurist:in',
    'Beschluss / Eintragung der Prokura (HR-Eintrag)',
    'Umfang: Prokura nach HGB (typische Geschäftsführungshandlungen)',
    'Unterschrift der vertretungsberechtigten Person',
];

export function generatePowerOfAttorneyFields(values: FieldValues): GenerateOutput {
    const kind = values.type ?? 'general';
    const items = kind === 'specific' ? SPECIFIC : kind === 'prokura' ? PROKURA : GENERAL;
    const title =
        kind === 'specific'
            ? 'Vollmacht — Felder (Einzelvollmacht)'
            : kind === 'prokura'
              ? 'Prokura — Felder'
              : 'Vollmacht — Felder (allgemein)';

    const lines = [
        title,
        '—',
        ...items.map((item, i) => `[ ] ${i + 1}. ${item}`),
        '',
        'Hinweis: Keine Rechtsberatung — keine fertige Vollmacht.',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'vollmacht-felder.txt' };
}
