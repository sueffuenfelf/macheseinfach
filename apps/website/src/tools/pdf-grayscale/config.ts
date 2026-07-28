import { defineTool } from '../types';
import { PdfGrayscaleTool } from './PdfGrayscaleTool';

const catalog = {
    id: 'pdf-grayscale',
    slug: 'pdf-grayscale',
    shortTitle: 'Graustufen',
    title: 'PDF in Graustufen',
    sub: 'Farbe entfernen — oft deutlich kleinere Uploads für Behörden-Portale.',
    pain: 'Farbscan sprengt das Upload-Limit, Inhalt muss lesbar bleiben.',
    solution: 'Seiten als Graustufen-PDF rendern und speichern.',
    trust: 'Konvertiert lokal · kein Upload',
    tags: ['PDF', 'Graustufen', 'Upload'],
    keywords: ['pdf', 'graustufen', 'schwarzweiss', 'grau', 'verkleinern', 'upload', 'amt'],
    fileHints: ['pdf'],
    command: '/pdf grayscale',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfGrayscaleTool }, 'pdf-grayscale');
