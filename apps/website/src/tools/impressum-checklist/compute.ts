import type { FieldValues, GenerateOutput } from '../_shared/shells';

const PRIVATE = [
    'Name und ladungsfähige Anschrift',
    'Kontakt: E-Mail (Pflicht bei geschäftsmäßigem Online-Auftritt)',
    'Optional: Telefonnummer',
    'Hinweis: Privatblog ohne Werbung oft ohne Impressum — bei Monetarisierung prüfen',
];

const BUSINESS = [
    'Name/Firma und Rechtsform',
    'Ladungsfähige Anschrift (kein Postfach allein)',
    'Kontakt: E-Mail und ggf. Telefon, Fax',
    'Vertretungsberechtigte Person(en)',
    'Handelsregister: Registergericht und Registernummer (falls eingetragen)',
    'Umsatzsteuer-ID oder Wirtschafts-ID (falls vorhanden)',
    'Aufsichtsbehörde (falls reglementierter Beruf)',
    'Berufshaftpflicht (falls Pflicht)',
];

const BLOG = [
    ...BUSINESS,
    'Verantwortlich für journalistisch-redaktionelle Inhalte (§ 18 MStV)',
    'Hinweis auf Affiliate-Links / Werbung, falls vorhanden',
];

export function generateImpressumChecklist(values: FieldValues): GenerateOutput {
    const kind = values.siteType ?? 'business';
    const items = kind === 'private' ? PRIVATE : kind === 'blog' ? BLOG : BUSINESS;
    const title =
        kind === 'private'
            ? 'Impressum-Checkliste — privat'
            : kind === 'blog'
              ? 'Impressum-Checkliste — Blog/Medien'
              : 'Impressum-Checkliste — gewerblich';

    const lines = [
        title,
        '—',
        ...items.map((item, i) => `[ ] ${i + 1}. ${item}`),
        '',
        'Hinweis: Keine Rechtsberatung. DDG/TMG-Pflichten je nach Angebot prüfen.',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'impressum-checkliste.txt' };
}
