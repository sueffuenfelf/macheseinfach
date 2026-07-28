const UMLAUT_MAP: Record<string, string> = {
    ä: 'ae',
    ö: 'oe',
    ü: 'ue',
    Ä: 'ae',
    Ö: 'oe',
    Ü: 'ue',
    ß: 'ss',
};

/** German title → URL slug (lowercase, hyphenated). */
export function titleToSlug(title: string): string {
    let s = title.trim();
    for (const [from, to] of Object.entries(UMLAUT_MAP)) {
        s = s.split(from).join(to);
    }
    return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}
