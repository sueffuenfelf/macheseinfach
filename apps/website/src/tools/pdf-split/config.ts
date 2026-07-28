import { defineTool } from '../types';
import { PdfSplitTool } from './PdfSplitTool';

const catalog = {
    id: 'pdf-split',
    slug: 'pdf-split',
    shortTitle: 'PDF teilen',
    title: 'PDF teilen',
    sub: 'Seiten oder Bereiche als eigene PDF speichern — für Portale mit Einzeldatei-Uploads.',
    pain: 'Das Amt will nur bestimmte Seiten — nicht die ganze Mappe.',
    solution: 'Seitenbereich wählen oder jede Seite einzeln exportieren.',
    trust: 'Teilt lokal im Browser · kein Upload',
    tags: ['PDF', 'Teilen', 'Upload'],
    keywords: ['pdf', 'teilen', 'split', 'seiten', 'bereich', 'extrahieren', 'amt'],
    fileHints: ['pdf'],
    command: '/pdf split',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden', 'dokumente'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfSplitTool }, 'pdf-split');
