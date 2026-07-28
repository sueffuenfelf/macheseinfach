import type { GenerateOutput, FieldValues } from '../_shared/shells';

/** Build Open Graph / Twitter Card preview summary. */
export function generateOgPreview(values: FieldValues): GenerateOutput {
    const title = values.title?.trim() ?? '';
    const description = values.description?.trim() ?? '';
    const image = values.image?.trim() ?? '';
    const url = values.url?.trim() ?? 'https://beispiel.de/seite';
    const type = values.type?.trim() || 'website';

    if (!title && !description) return null;

    const lines = [
        '── Social Preview (vereinfacht) ──',
        '',
        `[Bild: ${image || '— kein og:image —'}]`,
        '',
        title || '(og:title fehlt)',
        description || '(og:description fehlt)',
        '',
        `og:url → ${url}`,
        `og:type → ${type}`,
        '',
        '── Meta-Tags zum Kopieren ──',
        `<meta property="og:title" content="${escapeAttr(title)}" />`,
        `<meta property="og:description" content="${escapeAttr(description)}" />`,
        `<meta property="og:url" content="${escapeAttr(url)}" />`,
        `<meta property="og:type" content="${escapeAttr(type)}" />`,
    ];
    if (image) {
        lines.push(`<meta property="og:image" content="${escapeAttr(image)}" />`);
    }
    lines.push(
        `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
        `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
        `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    );

    return { kind: 'code', content: lines.join('\n'), language: 'html' };
}

function escapeAttr(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
