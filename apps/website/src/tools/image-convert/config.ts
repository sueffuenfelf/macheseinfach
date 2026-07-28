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
    storyIds: ['story-heic-portal', 'story-bild-format-aendern', 'story-portal-foto'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageConvertTool,
        variants: buildConversionVariants,
    },
    'image-convert',
);
