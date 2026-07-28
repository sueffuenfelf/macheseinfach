import type { GenerateOutput, FieldValues } from '../_shared/shells';

function truncate(text: string, max: number): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Build Google-style SERP snippet preview text. */
export function generateMetaPreview(values: FieldValues): GenerateOutput {
    const title = values.title?.trim() ?? '';
    const description = values.description?.trim() ?? '';
    const url = values.url?.trim() ?? 'https://beispiel.de/seite';

    if (!title && !description) return null;

    const displayTitle = truncate(title || 'Seitentitel fehlt', 60);
    const displayDesc = truncate(description || 'Meta-Description fehlt — Google wählt oft eigenen Text.', 160);
    const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const lines = [
        '── Google-Vorschau (vereinfacht) ──',
        '',
        displayUrl,
        displayTitle,
        displayDesc,
        '',
        `Title: ${title.length} Zeichen · Description: ${description.length} Zeichen`,
    ];

    if (!title) lines.push('⚠ Kein Title — Snippet-Titel kann beliebig sein.');
    if (!description) lines.push('⚠ Keine Description — Google extrahiert Text von der Seite.');

    return { kind: 'text', content: lines.join('\n') };
}
