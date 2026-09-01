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
    Datenschutz: { id: 'Datenschutz', label: 'Datenschutz', group: 'thema' },
    Rechnung: { id: 'Rechnung', label: 'Rechnung', group: 'thema' },
    IBAN: { id: 'IBAN', label: 'IBAN', group: 'thema' },
    Foto: { id: 'Foto', label: 'Foto', group: 'thema' },
    iPhone: { id: 'iPhone', label: 'iPhone', group: 'thema' },
    Bewerbung: { id: 'Bewerbung', label: 'Bewerbung', group: 'thema' },
    Vertrag: { id: 'Vertrag', label: 'Vertrag', group: 'thema' },
    Passfoto: { id: 'Passfoto', label: 'Passfoto', group: 'thema' },
    Teilen: { id: 'Teilen', label: 'Teilen', group: 'aktion' },
    Drehen: { id: 'Drehen', label: 'Drehen', group: 'aktion' },
    Sortieren: { id: 'Sortieren', label: 'Sortieren', group: 'aktion' },
    JWT: { id: 'JWT', label: 'JWT', group: 'thema' },
    Schreiben: { id: 'Schreiben', label: 'Schreiben', group: 'thema' },
    Zähler: { id: 'Zähler', label: 'Zähler', group: 'aktion' },
    Umwandeln: { id: 'Umwandeln', label: 'Umwandeln', group: 'aktion' },
    Aufräumen: { id: 'Aufräumen', label: 'Aufräumen', group: 'aktion' },
    Diff: { id: 'Diff', label: 'Diff', group: 'aktion' },
    Markdown: { id: 'Markdown', label: 'Markdown', group: 'format' },
    SMS: { id: 'SMS', label: 'SMS', group: 'format' },
    Lesbarkeit: { id: 'Lesbarkeit', label: 'Lesbarkeit', group: 'thema' },
    Platzhalter: { id: 'Platzhalter', label: 'Platzhalter', group: 'thema' },
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
    Kontrast: { id: 'Kontrast', label: 'Kontrast', group: 'aktion' },
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
