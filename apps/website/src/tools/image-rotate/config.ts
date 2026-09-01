import { defineTool } from '../types';
import { ImageRotateTool } from './ImageRotateTool';

const catalog = {
    id: 'image-rotate',
    slug: 'image-rotate',
    shortTitle: 'Bild ausrichten',
    title: 'Bilder drehen & spiegeln',
    sub: '90°, 180°, 270° drehen oder horizontal/vertikal spiegeln — lokal im Browser.',
    pain: 'Das Foto liegt auf der Seite oder ist gespiegelt.',
    solution: 'Bilder drehen und spiegeln — komplett im Browser.',
    trust: 'Bearbeitet im Browser · kein Upload',
    tags: ['Foto', 'PNG', 'JPG', 'WebP', 'HEIC'],
    keywords: ['bild', 'drehen', 'spiegeln', 'ausrichten', 'rotate', 'flip'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild rotate',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'beta',
    areas: ['bilder'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageRotateTool,
    },
    'image-rotate',
);
