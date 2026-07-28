import { defineTool } from '../types';
import { PdfSignTool } from './PdfSignTool';

const catalog = {
    id: 'pdf-sign',
    slug: 'pdf-sign',
    shortTitle: 'Signieren',
    title: 'PDF unterschreiben',
    sub: 'Setz deine Unterschrift an die richtige Stelle im Dokument.',
    pain: 'Drucken, unterschreiben, einscannen — Medienbruch 2026.',
    solution: 'Unterschrift zeichnen und im PDF platzieren.',
    trust: 'Signiert im Browser · kein Upload',
    tags: ['PDF', 'Signatur', 'Vertrag'],
    keywords: ['signatur', 'unterschrift', 'vertrag', 'sign', 'pdf', 'zeichnen'],
    fileHints: ['pdf'],
    command: '/pdf sign',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: ['story-vertrag-unterschreiben'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfSignTool,
    },
    'pdf-sign',
);
