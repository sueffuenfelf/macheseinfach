import { defineTool } from '../types';
import { PdfFlattenTool } from './PdfFlattenTool';

const catalog = {
    id: 'pdf-flatten',
    slug: 'pdf-flatten',
    shortTitle: 'PDF flatten',
    title: 'PDF-Formular flatten',
    sub: 'Ausfüllbare Felder ins Druckbild einbetten — für Versand und Archivierung.',
    pain: 'Das ausgefüllte Formular soll nicht mehr editierbar sein.',
    solution: 'AcroForm-Felder flatten und als festes PDF speichern.',
    trust: 'Datei bleibt auf deinem Gerät',
    tags: ['PDF', 'Formular'],
    keywords: ['pdf flatten', 'formular einbetten', 'acroform flatten', 'pdf formular fixieren'],
    fileHints: ['pdf'],
    command: '/pdf flatten',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'beta',
    areas: ['dokumente', 'behoerden'],
    storyIds: [],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfFlattenTool,
    },
    'pdf-flatten',
);
