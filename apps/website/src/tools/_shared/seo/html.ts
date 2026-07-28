export type HeadingEntry = {
    level: number;
    text: string;
};

function stripTags(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/** Extract H1–H6 from HTML paste (regex — works in Bun tests). */
export function extractHeadings(html: string): HeadingEntry[] {
    const entries: HeadingEntry[] = [];
    const re = /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) {
        const level = Number(match[1]);
        const text = stripTags(match[2] ?? '');
        if (text) entries.push({ level, text });
    }
    return entries;
}

export type LinkTag = {
    href?: string;
    rel?: string;
    hreflang?: string;
};

function parseLinkAttributes(tag: string): LinkTag {
    const attrs: LinkTag = {};
    const attrRe = /(\w[\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(tag)) !== null) {
        const key = (m[1] ?? '').toLowerCase();
        const value = m[2] ?? m[3] ?? m[4] ?? '';
        if (key === 'href') attrs.href = value;
        else if (key === 'rel') attrs.rel = value.toLowerCase();
        else if (key === 'hreflang') attrs.hreflang = value.toLowerCase();
    }
    return attrs;
}

/** All `<link>` tags with rel/href/hreflang. */
export function extractLinkTags(html: string): LinkTag[] {
    const tags: LinkTag[] = [];
    const re = /<link\s[^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) {
        tags.push(parseLinkAttributes(match[0]));
    }
    return tags;
}

export function extractCanonicalLinks(html: string): string[] {
    return extractLinkTags(html)
        .filter((t) => t.rel?.includes('canonical') && t.href)
        .map((t) => t.href as string);
}

export type HreflangEntry = {
    hreflang: string;
    href: string;
};

export function extractHreflangLinks(html: string): HreflangEntry[] {
    return extractLinkTags(html)
        .filter((t) => t.rel?.includes('alternate') && t.hreflang && t.href)
        .map((t) => ({ hreflang: t.hreflang as string, href: t.href as string }));
}
