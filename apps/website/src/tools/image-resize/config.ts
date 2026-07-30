import { defineTool } from '../types';
import { ImageResizeTool } from './ImageResizeTool';

const catalog = {
    id: 'image-resize',
    slug: 'image-resize',
    shortTitle: 'Bild verkleinern',
    title: 'Bilder verkleinern',
    sub: 'Abmessungen reduzieren — max. Breite/Höhe, Seitenverhältnis bleibt erhalten.',
    pain: 'Das Foto hat zu viele Pixel für Upload oder E-Mail.',
    solution: 'Bilder auf maximale Abmessungen skalieren — lokal im Browser.',
    trust: 'Skaliert im Browser · kein Upload',
    tags: ['Foto', 'PNG', 'JPG', 'WebP', 'HEIC'],
    keywords: ['bild', 'verkleinern', 'skalieren', 'abmessungen', 'pixel', 'resize'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild resize',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'beta',
    areas: ['bilder'],
    storyIds: ['story-bild-verkleinern', 'story-portal-foto'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageResizeTool,
    },
    'image-resize',
);
