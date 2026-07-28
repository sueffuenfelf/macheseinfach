import { defineTool } from '../types';
import { PdfPageReorderTool } from './PdfPageReorderTool';

const catalog = {
    id: 'pdf-page-reorder',
    slug: 'pdf-page-reorder',
    shortTitle: 'Seiten sortieren',
    title: 'PDF-Seiten sortieren',
    sub: 'Reihenfolge der Seiten anpassen — bevor du die Mappe hochlädst.',
    pain: 'Seiten liegen falsch sortiert (Scan-Reihenfolge, Anhänge).',
    solution: 'Vorschauliste umsortieren und neu speichern.',
    trust: 'Sortiert lokal · kein Upload',
    tags: ['PDF', 'Sortieren', 'Upload'],
    keywords: ['pdf', 'sortieren', 'reihenfolge', 'seiten', 'umordnen', 'reorder'],
    fileHints: ['pdf'],
    command: '/pdf reorder',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden', 'dokumente'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfPageReorderTool }, 'pdf-page-reorder');
