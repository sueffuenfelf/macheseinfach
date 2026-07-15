import { normalizeQuery, normalizeToken } from './normalize';
import { DE_STOPWORDS, tokenize } from './tokenize';
import type { DocumentSlots, QuerySlots } from './types';

const FORMAT_ALIASES: Record<string, string> = {
    heic: 'heic',
    heif: 'heic',
    jpg: 'jpg',
    jpeg: 'jpg',
    png: 'png',
    webp: 'webp',
    gif: 'gif',
    tiff: 'tiff',
    tif: 'tiff',
    avif: 'avif',
    pdf: 'pdf',
};

const ACTION_ALIASES: Record<string, string> = {
    konvertieren: 'convert',
    konvertierung: 'convert',
    umwandeln: 'convert',
    wandeln: 'convert',
    convert: 'convert',
    komprimieren: 'compress',
    verkleinern: 'compress',
    compress: 'compress',
    verkleinere: 'compress',
    drehen: 'rotate',
    rotieren: 'rotate',
    rotate: 'rotate',
    ausrichten: 'rotate',
    metadaten: 'exif',
    exif: 'exif',
    entfernen: 'exif',
    strip: 'exif',
    validieren: 'validate',
    pruefen: 'validate',
    prüfen: 'validate',
    check: 'validate',
    merge: 'merge',
    zusammenfuegen: 'merge',
    zusammenfügen: 'merge',
    schwaerzen: 'redact',
    schwärzen: 'redact',
    redact: 'redact',
    signieren: 'sign',
    sign: 'sign',
    ocr: 'ocr',
    scannen: 'ocr',
    qr: 'qr',
    girocode: 'girocode',
    iban: 'iban',
    resize: 'resize',
    skalieren: 'resize',
};

const CONTEXT_ALIASES: Record<string, string> = {
    iphone: 'iphone',
    ios: 'iphone',
    portal: 'portal',
    behoerde: 'behoerde',
    behörde: 'behoerde',
    elster: 'elster',
    finanzamt: 'behoerde',
    rechnung: 'rechnung',
    invoice: 'rechnung',
    vermieter: 'vermieter',
    gehalt: 'gehalt',
    passwort: 'security',
    password: 'security',
    leak: 'security',
    seo: 'seo',
    sitemap: 'seo',
    pipeline: 'pipeline',
    mehrere: 'pipeline',
    schritte: 'pipeline',
    kette: 'pipeline',
    bild: 'bild',
    bilder: 'bild',
    foto: 'bild',
    fotos: 'bild',
    screenshot: 'bild',
};

const MULTI_STEP_PATTERNS = [
    /\bund\s+dann\b/,
    /\bdanach\b/,
    /\bmehrere\s+schritte\b/,
    /\bpipeline\b/,
    /\bkette\b/,
    /\bund\s+.*\s+und\b/,
];

function matchAliases(text: string, aliases: Record<string, string>): string[] {
    const tokens = tokenize(text, { dropStopwords: true });
    const found = new Set<string>();

    for (const token of tokens) {
        const norm = normalizeToken(token);
        const mapped = aliases[norm] ?? aliases[token];
        if (mapped) found.add(mapped);
    }

    // Phrase patterns like "heic zu png"
    const normalized = normalizeQuery(text);
    for (const [alias, value] of Object.entries(aliases)) {
        if (alias.includes(' ') && normalized.includes(alias)) {
            found.add(value);
        }
    }

    const zuMatch = normalized.match(/(\w+)\s+zu\s+(\w+)/);
    if (zuMatch) {
        const from = FORMAT_ALIASES[zuMatch[1]!];
        const to = FORMAT_ALIASES[zuMatch[2]!];
        if (from) found.add(from);
        if (to) found.add(to);
    }

    return [...found];
}

export function extractQuerySlots(query: string): QuerySlots {
    const normalized = normalizeQuery(query);
    const multiStep = MULTI_STEP_PATTERNS.some((pattern) => pattern.test(normalized));

    return {
        formats: matchAliases(query, FORMAT_ALIASES),
        actions: matchAliases(query, ACTION_ALIASES),
        context: matchAliases(query, CONTEXT_ALIASES),
        multiStep,
    };
}

export function slotBoostForDocument(
    querySlots: QuerySlots,
    docSlots: DocumentSlots,
): number {
    let boost = 0;

    for (const format of querySlots.formats) {
        if (docSlots.formats.includes(format)) boost += 0.15;
    }
    for (const action of querySlots.actions) {
        if (docSlots.actions.includes(action)) boost += 0.12;
    }
    for (const ctx of querySlots.context) {
        if (docSlots.context.includes(ctx)) boost += 0.08;
    }
    if (querySlots.multiStep && docSlots.multiStep) boost += 0.2;

    return Math.min(boost, 0.6);
}

export function inferToolSlots(toolId: string, tags: readonly string[]): DocumentSlots {
    const actions: string[] = [];
    const formats: string[] = [];
    const context: string[] = [];

    if (toolId.includes('convert')) actions.push('convert');
    if (toolId.includes('compress')) actions.push('compress');
    if (toolId.includes('resize')) actions.push('resize');
    if (toolId.includes('rotate')) actions.push('rotate');
    if (toolId.includes('exif')) actions.push('exif');
    if (toolId.includes('pdf-compress')) actions.push('compress');
    if (toolId.includes('pdf-merge')) actions.push('merge');
    if (toolId.includes('pdf-redact')) actions.push('redact');
    if (toolId.includes('pdf-sign')) actions.push('sign');
    if (toolId.includes('ocr')) actions.push('ocr');
    if (toolId.includes('iban')) actions.push('validate');
    if (toolId.includes('girocode')) actions.push('girocode');
    if (toolId.includes('pwned')) actions.push('security');

    for (const tag of tags) {
        const norm = normalizeToken(tag);
        if (FORMAT_ALIASES[norm]) formats.push(FORMAT_ALIASES[norm]!);
        if (CONTEXT_ALIASES[norm]) context.push(CONTEXT_ALIASES[norm]!);
    }

    return {
        formats: [...new Set(formats)],
        actions: [...new Set(actions)],
        context: [...new Set(context)],
        multiStep: toolId.includes('pipeline') || tags.some((t) => t.toLowerCase().includes('pipeline')),
    };
}

export { DE_STOPWORDS };
