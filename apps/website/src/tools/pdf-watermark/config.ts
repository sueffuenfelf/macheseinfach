import { defineTool } from '../types';
import { PdfWatermarkTool } from './PdfWatermarkTool';

const catalog = {
    id: 'pdf-watermark',
    slug: 'pdf-wasserzeichen',
    shortTitle: 'PDF-Wasserzeichen',
    title: 'Wasserzeichen in PDF',
    sub: 'ENTWURF, VERTRAULICH oder eigenen Text diagonal auf jede Seite legen.',
    pain: 'Das Dokument soll als Entwurf oder Kopie erkennbar sein.',
    solution: 'Text-Wasserzeichen auf alle Seiten — lokal im Browser.',
    trust: 'Datei bleibt auf deinem Gerät',
    tags: ['PDF', 'Text'],
    keywords: ['pdf wasserzeichen', 'entwurf pdf', 'vertraulich pdf', 'watermark pdf'],
    fileHints: ['pdf'],
    command: '/pdf watermark',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfWatermarkTool,
    },
    'pdf-watermark',
);
