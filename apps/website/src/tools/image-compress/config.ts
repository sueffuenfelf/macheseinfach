import { createImageStepWidget } from '../_shared/widgets/ImageStepWidget';
import { defineTool } from '../types';
import { ImageCompressTool } from './ImageCompressTool';

const catalog = {
    id: 'image-compress',
    slug: 'image-compress',
    shortTitle: 'Bild komprimieren',
    title: 'Bilder komprimieren',
    sub: 'Dateigröße reduzieren — Qualität einstellen, lokal im Browser.',
    pain: 'Upload-Limit oder voller Speicher — das Foto ist zu groß.',
    solution: 'Bilder mit einstellbarer Qualität komprimieren — ohne Upload.',
    trust: 'Komprimiert im Browser · kein Upload',
    tags: ['Foto', 'PNG', 'JPG', 'WebP', 'HEIC'],
    keywords: ['bild', 'komprimieren', 'qualität', 'verkleinern', 'dateigröße', 'foto'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild compress',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'beta',
    areas: ['bilder'],
    storyIds: ['story-bild-verkleinern'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageCompressTool,
        widgets: [
            createImageStepWidget('image-compress', {
                widgetId: 'widget-image-compress',
                title: 'Bild komprimieren',
                description: 'Bilder mit Qualität 82 % komprimieren — Pipeline-fähig.',
                tags: ['Foto', 'PNG', 'JPG', 'Pipeline'],
                step: { kind: 'compress', compress: { quality: 0.82, format: 'jpg' } },
                actionLabel: 'Bild komprimieren',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'image-compress',
);
