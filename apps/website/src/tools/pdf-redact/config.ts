import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
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
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-pdf-redact',
                title: 'PDF Schwärzen',
                description: 'Dokument vorbereiten und sensible Stellen im Tool markieren.',
                tags: ['PDF', 'Datenschutz', 'Schwärzen'],
                acceptLabel: 'PDF',
                emptyHint: 'Ziehe das PDF mit sensiblen Daten hier hinein.',
                footerHint: 'Schwärzung erfolgt nach Öffnen des Tools.',
                openLabel: 'Redact-Tool öffnen',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'pdf-redact',
);
