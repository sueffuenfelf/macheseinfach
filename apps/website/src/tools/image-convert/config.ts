import { createImageStepWidget } from '../_shared/widgets/ImageStepWidget';
import { IMAGE_FILE_DROP_WIDGET_DEF } from '../_shared/widgets/ImageFileDropWidget';
import { buildConversionVariants } from '../_shared/image/variants';
import { defineTool } from '../types';
import { ImageConvertTool } from './ImageConvertTool';

const catalog = {
    id: 'image-convert',
    slug: 'image-convert',
    shortTitle: 'Bild konvertieren',
    title: 'Bilder umwandeln',
    sub: 'HEIC, PNG, JPG und WebP — lokal im Browser, ohne Upload.',
    pain: 'Portale und Formulare akzeptieren nicht jedes Bildformat.',
    solution: 'Bilder zwischen Formaten umwandeln — komplett im Browser.',
    trust: 'Umgewandelt im Browser · kein Upload',
    tags: ['HEIC', 'PNG', 'JPG', 'WebP', 'Foto', 'iPhone'],
    keywords: ['heic', 'jpg', 'png', 'webp', 'foto', 'iphone', 'umwandeln', 'konvertieren', 'bild'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'beta',
    areas: ['bilder'],
    storyIds: ['story-heic-portal', 'story-bild-format-aendern'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageConvertTool,
        variants: buildConversionVariants,
        widgets: [
            IMAGE_FILE_DROP_WIDGET_DEF,
            createImageStepWidget('image-convert', {
                widgetId: 'widget-image-convert',
                title: 'Bild-Konverter',
                description: 'HEIC/PNG/WebP in JPG oder PNG umwandeln — Pipeline-fähig.',
                tags: ['HEIC', 'PNG', 'JPG', 'Pipeline'],
                step: { kind: 'convert', convert: { to: 'jpg' } },
                actionLabel: 'Bild konvertieren',
                defaultW: 5,
                defaultH: 4,
            }),
        ],
    },
    'image-convert',
);
