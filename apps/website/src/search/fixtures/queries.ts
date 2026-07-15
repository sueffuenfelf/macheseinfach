/** 40+ Suchanfragen mit erwarteten Top-Treffer-IDs (Präfix oder exakt). */
export type SearchFixture = {
    query: string;
    expectTopKind?: 'tool' | 'variant' | 'story' | 'area' | 'template';
    expectIdContains: string;
    minScore?: number;
};

export const SEARCH_FIXTURES: SearchFixture[] = [
    { query: 'heic', expectIdContains: 'variant:heic', expectTopKind: 'variant' },
    { query: 'heic zu png', expectIdContains: 'heic-zu-png', expectTopKind: 'variant' },
    { query: 'heic zu jpg', expectIdContains: 'heic-zu-jpg', expectTopKind: 'variant' },
    { query: 'iphone foto', expectIdContains: 'heic', minScore: 0.2 },
    { query: 'heic konvertieren', expectIdContains: 'heic', expectTopKind: 'variant' },
    { query: 'png zu jpg', expectIdContains: 'png-zu-jpg', expectTopKind: 'variant' },
    { query: 'jpg zu png', expectIdContains: 'jpg-zu-png', expectTopKind: 'variant' },
    { query: 'webp zu png', expectIdContains: 'webp-zu-png', expectTopKind: 'variant' },
    { query: 'bild verkleinern', expectIdContains: 'image-compress', expectTopKind: 'tool' },
    { query: 'bild komprimieren', expectIdContains: 'image-compress' },
    { query: 'foto verkleinern', expectIdContains: 'compress' },
    { query: 'bild drehen', expectIdContains: 'image-rotate' },
    { query: 'foto rotieren', expectIdContains: 'rotate' },
    { query: 'metadaten entfernen', expectIdContains: 'exif' },
    { query: 'exif strip', expectIdContains: 'image-exif-strip' },
    { query: 'pdf verkleinern', expectIdContains: 'pdf-compress' },
    { query: 'elster pdf', expectIdContains: 'pdf-compress' },
    { query: 'pdf zu gross', expectIdContains: 'pdf-compress' },
    { query: 'pdf schwärzen', expectIdContains: 'pdf-redact' },
    { query: 'gehalt schwärzen', expectIdContains: 'pdf-redact' },
    { query: 'pdf zusammenfügen', expectIdContains: 'pdf-merge' },
    { query: 'pdf signieren', expectIdContains: 'pdf-sign' },
    { query: 'iban prüfen', expectIdContains: 'iban-validate' },
    { query: 'iban validieren', expectIdContains: 'iban' },
    { query: 'girocode', expectIdContains: 'girocode-gen' },
    { query: 'qr rechnung', expectIdContains: 'girocode' },
    { query: 'passwort leak', expectIdContains: 'pwned' },
    { query: 'passwort prüfen', expectIdContains: 'pwned-check' },
    { query: 'ocr', expectIdContains: 'ocr-local' },
    { query: 'text aus scan', expectIdContains: 'ocr' },
    { query: 'bilder', expectIdContains: 'area:bilder', expectTopKind: 'area' },
    { query: 'buchhaltung', expectIdContains: 'area:buchhaltung', expectTopKind: 'area' },
    { query: 'behörden', expectIdContains: 'area:behoerden', expectTopKind: 'area' },
    { query: 'dokumente', expectIdContains: 'area:dokumente' },
    { query: 'pipeline', expectIdContains: 'template:bild-portal', expectTopKind: 'template' },
    { query: 'mehrere schritte bild', expectIdContains: 'pipeline', minScore: 0.2 },
    { query: 'heic und dann verkleinern', expectIdContains: 'template:bild-portal' },
    { query: 'portal heic', expectIdContains: 'heic' },
    { query: 'screenshot png', expectIdContains: 'png' },
    { query: 'bild format ändern', expectIdContains: 'image-convert' },
    { query: 'resize bild', expectIdContains: 'image-resize' },
    { query: 'bild skalieren', expectIdContains: 'resize' },
    { query: 'seo sitemap', expectIdContains: 'seo' },
    { query: 'meta preview', expectIdContains: 'seo' },
    { query: 'vertrag unterschreiben', expectIdContains: 'pdf-sign' },
    { query: 'bewerbung pdf', expectIdContains: 'pdf-merge' },
];

export const EXAMPLE_SEARCH_CHIPS = [
    'HEIC zu PNG',
    'PDF verkleinern',
    'IBAN prüfen',
    'Bild verkleinern',
    'Passwort-Leak',
    'Bild-Pipeline',
];
