import { defineTool } from '../types';
import { PdfRedactTool } from './PdfRedactTool';

const catalog = {
    id: 'pdf-redact',
    slug: 'pdf-redact',
    shortTitle: 'PDF schwärzen',
    title: 'PDF schwärzen',
    sub: 'Markier sensible Zeilen — die Schwärzung wird fest ins PDF eingebrannt.',
    pain: 'Sensible Zeilen für Vermieter unkenntlich machen — ohne Acrobat.',
    solution: 'Echte Schwärzung: Text wird aus der PDF entfernt.',
    trust: 'Schwärzung wird lokal eingebrannt · kein Upload',
    tags: ['PDF', 'Datenschutz', 'Vermieter'],
    keywords: ['schwärzen', 'zensur', 'datenschutz', 'redact', 'unkenntlich'],
    fileHints: ['pdf'],
    command: '/pdf redact',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'beta',
    areas: ['behoerden'],
    storyIds: ['story-vermieter-gehalt-schwaarzen'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfRedactTool,
    },
    'pdf-redact',
);
