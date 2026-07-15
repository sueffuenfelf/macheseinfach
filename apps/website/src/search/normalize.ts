const UMLAUT_MAP: Record<string, string> = {
    ä: 'ae',
    ö: 'oe',
    ü: 'ue',
    ß: 'ss',
    Ä: 'ae',
    Ö: 'oe',
    Ü: 'ue',
};

/** Normalisiert deutschen Suchtext für Tokenisierung und Fuzzy-Match. */
export function normalizeText(input: string): string {
    let text = input.trim().toLowerCase();
    for (const [umlaut, replacement] of Object.entries(UMLAUT_MAP)) {
        text = text.split(umlaut).join(replacement);
    }
    return text
        .replace(/[^\p{L}\p{N}\s.-]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Entfernt Diakritika und Sonderzeichen für Partial-Match. */
export function normalizeToken(token: string): string {
    return normalizeText(token).replace(/[.-]/g, '');
}

export function normalizeQuery(query: string): string {
    return normalizeText(query);
}
