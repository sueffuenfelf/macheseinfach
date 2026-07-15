import { createFileTaskWidget } from '../_shared/widgets/FileTaskWidget';
import { defineTool } from '../types';
import { HeicTool } from './HeicTool';

const catalog = {
    id: 'heic-convert',
    slug: 'heic-convert',
    shortTitle: 'HEIC → JPG',
    title: 'HEIC umwandeln',
    sub: 'Mach aus iPhone-Fotos ein Format, das jedes Portal akzeptiert.',
    pain: 'Portale verlangen JPG/PNG — HEIC wird abgelehnt.',
    solution: 'HEIC → JPG/PNG im Browser, ohne Cloud.',
    trust: 'Umgewandelt im Browser · kein Upload',
    tags: ['HEIC', 'Foto', 'iPhone'],
    keywords: ['heic', 'jpg', 'foto', 'iphone', 'umwandeln', 'konvertieren', 'png'],
    fileHints: ['heic', 'heif'],
    command: '/heic',
    entry: 'file',
    theme: { accent: '#90a8ed', accentStrong: '#000', accentSoft: '#e6ecfb' },
    maturity: 'beta',
    areas: ['dokumente'],
    storyIds: ['story-heic-portal'],
} as const;

export default defineTool(
    {
        catalog,
        page: HeicTool,
        widgets: [
            createFileTaskWidget(catalog, {
                widgetId: 'widget-heic-convert',
                title: 'HEIC Konvertierer',
                description: 'HEIC-Dateien sammeln und direkt in die Konvertierung starten.',
                tags: ['HEIC', 'JPG', 'Datei'],
                acceptLabel: 'HEIC/HEIF',
                emptyHint: 'Zieh HEIC-Bilder hier rein.',
                footerHint: 'Konvertierung läuft erst nach Öffnen des Tools.',
                openLabel: 'HEIC-Tool öffnen',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'heic-convert',
);
