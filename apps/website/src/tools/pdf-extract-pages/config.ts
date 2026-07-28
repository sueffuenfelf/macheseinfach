import { defineTool } from '../types';
import { PdfExtractPagesTool } from './PdfExtractPagesTool';

const catalog = {
    id: 'pdf-extract-pages',
    slug: 'pdf-extract-pages',
    shortTitle: 'PDF-Seiten extrahieren',
    title: 'PDF-Seiten extrahieren',
    sub: 'Seiten 3–7 oder einzelne Seiten als neue PDF speichern.',
    pain: 'Nur ein Teil des Dokuments wird gebraucht — der Rest stört.',
    solution: 'Seitenbereich eingeben und als neue PDF herunterladen.',
    trust: 'Datei bleibt auf deinem Gerät',
    tags: ['PDF', 'Text'],
    keywords: ['pdf seiten extrahieren', 'seiten kopieren', 'pdf seitenbereich', 'seiten aus pdf'],
    fileHints: ['pdf'],
    command: '/pdf pages',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: [],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfExtractPagesTool,
    },
    'pdf-extract-pages',
);
