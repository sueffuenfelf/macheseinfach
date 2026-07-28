import { defineTool } from '../types';
import { PdfPageRotateTool } from './PdfPageRotateTool';

const catalog = {
    id: 'pdf-page-rotate',
    slug: 'pdf-page-rotate',
    shortTitle: 'Seiten drehen',
    title: 'PDF-Seiten drehen',
    sub: 'Falsch gescannte Seiten um 90° oder 180° drehen — bevor du hochlädst.',
    pain: 'Scan liegt quer — Portal akzeptiert nur aufrechte Seiten.',
    solution: 'Seiten einzeln oder alle drehen, lokal speichern.',
    trust: 'Dreht im Browser · kein Upload',
    tags: ['PDF', 'Drehen', 'Scan'],
    keywords: ['pdf', 'drehen', 'rotieren', 'seite', 'scan', 'quer', 'hochkant'],
    fileHints: ['pdf'],
    command: '/pdf rotate',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden', 'dokumente'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfPageRotateTool }, 'pdf-page-rotate');
