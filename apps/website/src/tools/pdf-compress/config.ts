import { defineTool } from '../types';
import { PdfCompressTool } from './PdfCompressTool';

const catalog = {
    id: 'pdf-compress',
    slug: 'pdf-compress',
    shortTitle: 'PDF verkleinern',
    title: 'PDF verkleinern',
    sub: 'Bring dein PDF unter das Größenlimit von Elster & Co. — ohne Qualität zu verschenken.',
    pain: 'Upload-Limit (z. B. 2 MB bei Elster) — Datei zu groß.',
    solution:
        'Clientseitig auf dein Upload-Limit komprimieren — mit Größenvorschau und Elster-Preset.',
    trust: 'Komprimiert im Browser · kein Upload',
    tags: ['PDF', 'Elster', 'Upload'],
    keywords: ['pdf', 'komprimieren', 'elster', 'amt', 'verkleinern', 'shrink', 'zielgroesse'],
    fileHints: ['pdf'],
    command: '/pdf compress',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: ['story-elster-pdf-limit'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfCompressTool,
    },
    'pdf-compress',
);
