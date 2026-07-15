import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
import { defineTool } from '../types';
import { PdfCompressTool } from './PdfCompressTool';

const catalog = {
    id: 'pdf-compress',
    slug: 'pdf-compress',
    shortTitle: 'PDF verkleinern',
    title: 'PDF verkleinern',
    sub: 'Bring dein PDF unter das Größenlimit von Elster & Co. — ohne Qualität zu verschenken.',
    pain: 'Upload-Limit (z. B. 2 MB bei Elster) — Datei zu groß.',
    solution: 'Clientseitig komprimieren mit Profil „Behörden / Elster“.',
    trust: 'Komprimiert im Browser · kein Upload',
    tags: ['PDF', 'Elster', 'Upload'],
    keywords: ['pdf', 'komprimieren', 'elster', 'amt', 'verkleinern', 'shrink'],
    fileHints: ['pdf'],
    command: '/pdf compress',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'beta',
    areas: ['behoerden'],
    storyIds: ['story-elster-pdf-limit'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfCompressTool,
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-pdf-compress',
                title: 'PDF Kompakt',
                description: 'Upload-Datei vorbereiten und Größe im Blick behalten.',
                tags: ['PDF', 'Komprimieren', 'Upload'],
                acceptLabel: 'PDF',
                emptyHint: 'Lege ein PDF zum Komprimieren ab.',
                footerHint: 'Komprimierung danach im Tool ausführen.',
                openLabel: 'PDF-Tool öffnen',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'pdf-compress',
);
