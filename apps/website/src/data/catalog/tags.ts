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
    QR: { id: 'QR', label: 'QR', group: 'format' },
    Upload: { id: 'Upload', label: 'Upload', group: 'aktion' },
    Merge: { id: 'Merge', label: 'Merge', group: 'aktion' },
    Signatur: { id: 'Signatur', label: 'Signatur', group: 'aktion' },
    Prüfen: { id: 'Prüfen', label: 'Prüfen', group: 'aktion' },
    OCR: { id: 'OCR', label: 'OCR', group: 'aktion' },
    Scan: { id: 'Scan', label: 'Scan', group: 'aktion' },
    Text: { id: 'Text', label: 'Text', group: 'aktion' },
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
    'E-Mail': { id: 'E-Mail', label: 'E-Mail', group: 'thema' },
    HIBP: { id: 'HIBP', label: 'HIBP', group: 'thema' },
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
