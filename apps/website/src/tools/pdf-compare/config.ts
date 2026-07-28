import { defineTool } from '../types';
import { PdfCompareTool } from './PdfCompareTool';

const catalog = {
    id: 'pdf-compare',
    slug: 'pdf-vergleichen',
    shortTitle: 'PDF vergleichen',
    title: 'PDFs vergleichen',
    sub: 'Zwei PDFs nebeneinander — Seitenanzahl und Text pro Seite im Überblick.',
    pain: 'Zwei Versionen eines Vertrags — was hat sich geändert?',
    solution: 'Beide PDFs laden und Seitenweise Text vergleichen.',
    trust: 'Dateien bleiben auf deinem Gerät',
    tags: ['PDF', 'Diff', 'Vertrag'],
    keywords: ['pdf vergleichen', 'pdf diff', 'vertrag vergleichen', 'pdf versionen'],
    fileHints: ['pdf'],
    command: '/pdf compare',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: [],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfCompareTool,
    },
    'pdf-compare',
);
