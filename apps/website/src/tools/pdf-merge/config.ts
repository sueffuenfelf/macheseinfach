import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
import { defineTool } from '../types';
import { PdfMergeTool } from './PdfMergeTool';

const catalog = {
    id: 'pdf-merge',
    slug: 'pdf-merge',
    shortTitle: 'PDFs mergen',
    title: 'PDFs zusammenfügen',
    sub: 'Zieh deine Dateien in die richtige Reihenfolge und füge sie zu einer PDF zusammen.',
    pain: 'Anschreiben, CV und Zeugnisse liegen als Einzeldateien vor.',
    solution: 'PDFs zusammenführen und Reihenfolge per Drag-and-Drop.',
    trust: 'Alles bleibt auf deinem Gerät',
    tags: ['PDF', 'Bewerbung', 'Merge'],
    keywords: ['merge', 'zusammenfügen', 'bewerbung', 'pdf', 'vereinen'],
    fileHints: ['pdf'],
    command: '/pdf merge',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: ['story-bewerbung-eine-pdf'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfMergeTool,
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-pdf-merge',
                title: 'PDF Merge Queue',
                description: 'Mehrere PDFs sammeln und Reihenfolge später im Tool setzen.',
                tags: ['PDF', 'Merge', 'Queue'],
                acceptLabel: 'Mehrere PDF',
                emptyHint: 'Wähle die PDFs, die zusammengeführt werden sollen.',
                footerHint: 'Die Sortierung passiert im Merge-Tool.',
                openLabel: 'Merge-Tool öffnen',
                defaultW: 6,
                defaultH: 4,
            }),
        ],
    },
    'pdf-merge',
);
