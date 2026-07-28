import { defineTool } from '../types';

const catalog = {
    id: 'ocr-local',
    slug: 'ocr-local',
    shortTitle: 'OCR',
    title: 'Text aus Scan kopieren',
    sub: 'Erkenn den Text aus einem gescannten Dokument und kopier ihn heraus.',
    pain: 'Behörden-PDF ist nur ein Bild — nichts markierbar.',
    solution: 'Lokale OCR — Text in Zwischenablage.',
    trust: 'Erkennung läuft lokal',
    tags: ['OCR', 'Scan', 'Text'],
    keywords: ['ocr', 'texterkennung', 'scan', 'text', 'kopieren'],
    fileHints: ['pdf', 'png', 'jpg', 'jpeg', 'tiff'],
    command: '/ocr',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'planned',
    areas: ['dokumente'],
    storyIds: ['story-scan-text-kopieren'],
} as const;

export default defineTool(
    {
        catalog,
    },
    'ocr-local',
);
