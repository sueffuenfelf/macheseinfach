import type { FieldValues, GenerateOutput } from '../_shared/shells';

const WEBSITE = [
    'Verantwortlicher (Name, Anschrift, Kontakt)',
    'Zweck der Datenverarbeitung (z. B. Kontaktformular, Hosting)',
    'Rechtsgrundlagen (Art. 6 DSGVO — z. B. Einwilligung, Vertrag, berechtigtes Interesse)',
    'Empfänger / Auftragsverarbeiter (Hosting, Newsletter-Tool, Analytics)',
    'Speicherdauer oder Löschkriterien',
    'Betroffenenrechte (Auskunft, Löschung, Widerspruch, Beschwerde bei Aufsicht)',
    'Pflicht zur Bereitstellung / Folgen der Nichtbereitstellung',
    'Automatisierte Entscheidung / Profiling (falls zutreffend)',
    'SSL/TLS-Verschlüsselung erwähnen',
    'Stand der Erklärung / Änderungsdatum',
];

const SHOP = [
    ...WEBSITE,
    'Bestelldaten, Zahlungsabwicklung, Versanddienstleister',
    'Widerrufsbelehrung und Muster-Widerrufsformular (B2C)',
    'Cookie-Consent und Tracking (falls eingesetzt)',
];

const NEWSLETTER = [
    ...WEBSITE,
    'Newsletter-Anmeldung: Einwilligung dokumentieren (Double-Opt-In)',
    'Inhalt des Newsletters und Häufigkeit',
    'Abmeldemöglichkeit in jeder Mail',
    'Newsletter-Tool als Auftragsverarbeiter (AV-Vertrag)',
];

export function generatePrivacyChecklist(values: FieldValues): GenerateOutput {
    const scope = values.scope ?? 'website';
    const items = scope === 'shop' ? SHOP : scope === 'newsletter' ? NEWSLETTER : WEBSITE;
    const title =
        scope === 'shop'
            ? 'Datenschutz-Checkliste — Shop'
            : scope === 'newsletter'
              ? 'Datenschutz-Checkliste — Newsletter'
              : 'Datenschutz-Checkliste — Website';

    const lines = [
        title,
        '—',
        ...items.map((item, i) => `[ ] ${i + 1}. ${item}`),
        '',
        'Hinweis: Keine Rechtsberatung — keine fertige Datenschutzerklärung.',
    ];
    return { kind: 'text', content: lines.join('\n'), filename: 'datenschutz-checkliste.txt' };
}
