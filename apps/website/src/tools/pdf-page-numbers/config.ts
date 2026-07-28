import { defineTool } from '../types';
import { PdfPageNumbersTool } from './PdfPageNumbersTool';

const catalog = {
    id: 'pdf-page-numbers',
    slug: 'pdf-seitenzahlen',
    shortTitle: 'Seitenzahlen',
    title: 'Seitenzahlen in PDF einfügen',
    sub: 'Nummerierung unten links, Mitte oder rechts — für Berichte und Verträge.',
    pain: 'Das Dokument hat keine Seitenzahlen — schwer zu referenzieren.',
    solution: 'PDF laden, Startnummer und Position wählen, herunterladen.',
    trust: 'Datei bleibt auf deinem Gerät',
    tags: ['PDF', 'Text'],
    keywords: ['seitenzahlen pdf', 'pdf nummerieren', 'seitennummer einfügen', 'page numbers pdf'],
    fileHints: ['pdf'],
    command: '/pdf pagenum',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: [],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfPageNumbersTool,
    },
    'pdf-page-numbers',
);
