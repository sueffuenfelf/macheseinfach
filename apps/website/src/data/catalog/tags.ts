/** Katalog-Tags mit Gruppen — SSOT für Filter-UI (Format · Thema · Aktion) */
export const TAG_GROUP_ORDER = [
    { id: 'format', label: 'Format' },
    { id: 'thema', label: 'Thema' },
    { id: 'aktion', label: 'Aktion' },
] as const;

export type TagGroupId = (typeof TAG_GROUP_ORDER)[number]['id'];

export type CatalogTagDefinition = {
    readonly id: string;
    readonly label: string;
    readonly group: TagGroupId;
};

/** Alle Tags aus tools.ts — jeder Tool-Tag muss hier registriert sein */
export const catalogTags = {
    PDF: { id: 'PDF', label: 'PDF', group: 'format' },
    HEIC: { id: 'HEIC', label: 'HEIC', group: 'format' },
    PNG: { id: 'PNG', label: 'PNG', group: 'format' },
    JPG: { id: 'JPG', label: 'JPG', group: 'format' },
    WebP: { id: 'WebP', label: 'WebP', group: 'format' },
    QR: { id: 'QR', label: 'QR', group: 'format' },
    Upload: { id: 'Upload', label: 'Upload', group: 'aktion' },
    Merge: { id: 'Merge', label: 'Merge', group: 'aktion' },
    Signatur: { id: 'Signatur', label: 'Signatur', group: 'aktion' },
    Prüfen: { id: 'Prüfen', label: 'Prüfen', group: 'aktion' },
    OCR: { id: 'OCR', label: 'OCR', group: 'aktion' },
    Scan: { id: 'Scan', label: 'Scan', group: 'aktion' },
    Text: { id: 'Text', label: 'Text', group: 'aktion' },
    Formular: { id: 'Formular', label: 'Formular', group: 'thema' },
    Elster: { id: 'Elster', label: 'Elster', group: 'thema' },
    Datenschutz: { id: 'Datenschutz', label: 'Datenschutz', group: 'thema' },
    Vermieter: { id: 'Vermieter', label: 'Vermieter', group: 'thema' },
    Rechnung: { id: 'Rechnung', label: 'Rechnung', group: 'thema' },
    Freelancer: { id: 'Freelancer', label: 'Freelancer', group: 'thema' },
    IBAN: { id: 'IBAN', label: 'IBAN', group: 'thema' },
    Bank: { id: 'Bank', label: 'Bank', group: 'thema' },
    Foto: { id: 'Foto', label: 'Foto', group: 'thema' },
    iPhone: { id: 'iPhone', label: 'iPhone', group: 'thema' },
    Bewerbung: { id: 'Bewerbung', label: 'Bewerbung', group: 'thema' },
    Vertrag: { id: 'Vertrag', label: 'Vertrag', group: 'thema' },
    Passwort: { id: 'Passwort', label: 'Passwort', group: 'thema' },
    Passfoto: { id: 'Passfoto', label: 'Passfoto', group: 'thema' },
    A4: { id: 'A4', label: 'A4', group: 'format' },
    Teilen: { id: 'Teilen', label: 'Teilen', group: 'aktion' },
    Drehen: { id: 'Drehen', label: 'Drehen', group: 'aktion' },
    Stempel: { id: 'Stempel', label: 'Stempel', group: 'aktion' },
    Entsperren: { id: 'Entsperren', label: 'Entsperren', group: 'aktion' },
    Sortieren: { id: 'Sortieren', label: 'Sortieren', group: 'aktion' },
    Graustufen: { id: 'Graustufen', label: 'Graustufen', group: 'aktion' },
    'E-Mail': { id: 'E-Mail', label: 'E-Mail', group: 'thema' },
    HIBP: { id: 'HIBP', label: 'HIBP', group: 'thema' },
    Security: { id: 'Security', label: 'Security', group: 'thema' },
    JWT: { id: 'JWT', label: 'JWT', group: 'thema' },
    '2FA': { id: '2FA', label: '2FA', group: 'thema' },
    Schreiben: { id: 'Schreiben', label: 'Schreiben', group: 'thema' },
    Zähler: { id: 'Zähler', label: 'Zähler', group: 'aktion' },
    Umwandeln: { id: 'Umwandeln', label: 'Umwandeln', group: 'aktion' },
    Aufräumen: { id: 'Aufräumen', label: 'Aufräumen', group: 'aktion' },
    Diff: { id: 'Diff', label: 'Diff', group: 'aktion' },
    Markdown: { id: 'Markdown', label: 'Markdown', group: 'format' },
    SMS: { id: 'SMS', label: 'SMS', group: 'format' },
    Lesbarkeit: { id: 'Lesbarkeit', label: 'Lesbarkeit', group: 'thema' },
    Platzhalter: { id: 'Platzhalter', label: 'Platzhalter', group: 'thema' },
    SEO: { id: 'SEO', label: 'SEO', group: 'thema' },
    Meta: { id: 'Meta', label: 'Meta', group: 'thema' },
    Sitemap: { id: 'Sitemap', label: 'Sitemap', group: 'thema' },
    OpenGraph: { id: 'OpenGraph', label: 'Open Graph', group: 'thema' },
    Schema: { id: 'Schema', label: 'Schema', group: 'thema' },
    Robots: { id: 'Robots', label: 'Robots', group: 'thema' },
    Miete: { id: 'Miete', label: 'Miete', group: 'thema' },
    Kaution: { id: 'Kaution', label: 'Kaution', group: 'thema' },
    Nebenkosten: { id: 'Nebenkosten', label: 'Nebenkosten', group: 'thema' },
    Umzug: { id: 'Umzug', label: 'Umzug', group: 'thema' },
    WG: { id: 'WG', label: 'WG', group: 'thema' },
    Checkliste: { id: 'Checkliste', label: 'Checkliste', group: 'aktion' },
    Rechnen: { id: 'Rechnen', label: 'Rechnen', group: 'aktion' },
    JSON: { id: 'JSON', label: 'JSON', group: 'format' },
    Base64: { id: 'Base64', label: 'Base64', group: 'format' },
    HTML: { id: 'HTML', label: 'HTML', group: 'format' },
    Dev: { id: 'Dev', label: 'Dev', group: 'thema' },
    Regex: { id: 'Regex', label: 'Regex', group: 'thema' },
    UUID: { id: 'UUID', label: 'UUID', group: 'thema' },
    Cron: { id: 'Cron', label: 'Cron', group: 'thema' },
    Hash: { id: 'Hash', label: 'Hash', group: 'aktion' },
    Encode: { id: 'Encode', label: 'Encode', group: 'aktion' },
    Zeit: { id: 'Zeit', label: 'Zeit', group: 'thema' },
    Frist: { id: 'Frist', label: 'Frist', group: 'thema' },
    Feiertage: { id: 'Feiertage', label: 'Feiertage', group: 'thema' },
    A11y: { id: 'A11y', label: 'Barrierefreiheit', group: 'thema' },
    Farbe: { id: 'Farbe', label: 'Farbe', group: 'thema' },
    CSS: { id: 'CSS', label: 'CSS', group: 'format' },
    Kontrast: { id: 'Kontrast', label: 'Kontrast', group: 'aktion' },
    WCAG: { id: 'WCAG', label: 'WCAG', group: 'thema' },
    Steuern: { id: 'Steuern', label: 'Steuern', group: 'thema' },
    MwSt: { id: 'MwSt', label: 'MwSt', group: 'thema' },
    AfA: { id: 'AfA', label: 'AfA', group: 'thema' },
    Pauschale: { id: 'Pauschale', label: 'Pauschale', group: 'thema' },
    Kindergeld: { id: 'Kindergeld', label: 'Kindergeld', group: 'thema' },
    Recht: { id: 'Recht', label: 'Recht', group: 'thema' },
    Kommunikation: { id: 'Kommunikation', label: 'Kommunikation', group: 'thema' },
    Kalender: { id: 'Kalender', label: 'Kalender', group: 'thema' },
    Impressum: { id: 'Impressum', label: 'Impressum', group: 'thema' },
    Widerruf: { id: 'Widerruf', label: 'Widerruf', group: 'thema' },
    WhatsApp: { id: 'WhatsApp', label: 'WhatsApp', group: 'thema' },
    Telegram: { id: 'Telegram', label: 'Telegram', group: 'thema' },
    vCard: { id: 'vCard', label: 'vCard', group: 'format' },
    DPI: { id: 'DPI', label: 'DPI', group: 'format' },
    Auflösung: { id: 'Auflösung', label: 'Auflösung', group: 'thema' },
    Druck: { id: 'Druck', label: 'Druck', group: 'thema' },
    Behörde: { id: 'Behörde', label: 'Behörde', group: 'thema' },
    Dokument: { id: 'Dokument', label: 'Dokument', group: 'thema' },
    Biometrisch: { id: 'Biometrisch', label: 'Biometrisch', group: 'thema' },
    Wasserzeichen: { id: 'Wasserzeichen', label: 'Wasserzeichen', group: 'aktion' },
    Copyright: { id: 'Copyright', label: 'Copyright', group: 'thema' },
    Helligkeit: { id: 'Helligkeit', label: 'Helligkeit', group: 'aktion' },
    Zuschneiden: { id: 'Zuschneiden', label: 'Zuschneiden', group: 'aktion' },
    Ausschnitt: { id: 'Ausschnitt', label: 'Ausschnitt', group: 'aktion' },
    Web: { id: 'Web', label: 'Web', group: 'thema' },
} as const satisfies Record<string, CatalogTagDefinition>;

export type CatalogTagId = keyof typeof catalogTags;

export type TagGroupSection = {
    readonly groupId: TagGroupId;
    readonly label: string;
    readonly tags: readonly string[];
};

export function getCatalogTag(tagId: string): CatalogTagDefinition | undefined {
    return catalogTags[tagId as CatalogTagId];
}

export function getTagGroup(tagId: string): TagGroupId {
    return getCatalogTag(tagId)?.group ?? 'thema';
}

/** Gruppiert eine Tag-Liste für die Filter-UI — leere Gruppen werden ausgelassen */
export function groupCatalogTags(tagIds: readonly string[]): TagGroupSection[] {
    const byGroup = new Map<TagGroupId, string[]>();
    for (const tag of tagIds) {
        const group = getTagGroup(tag);
        const list = byGroup.get(group) ?? [];
        list.push(tag);
        byGroup.set(group, list);
    }
    return TAG_GROUP_ORDER.flatMap((group) => {
        const tags = byGroup.get(group.id);
        if (!tags?.length) return [];
        return [
            {
                groupId: group.id,
                label: group.label,
                tags: [...tags].sort((a, b) => a.localeCompare(b, 'de')),
            },
        ];
    });
}
