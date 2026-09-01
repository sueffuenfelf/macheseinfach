import { defineTool } from '../types';
import { ImageExifStripTool } from './ImageExifStripTool';

const catalog = {
    id: 'image-exif-strip',
    slug: 'image-exif-strip',
    shortTitle: 'Metadaten entfernen',
    title: 'EXIF & GPS entfernen',
    sub: 'Standort, Kamera-Daten und EXIF vor dem Upload löschen — lokal im Browser.',
    pain: 'Standort und Kamera-Daten sollen nicht mit hochgeladen werden.',
    solution: 'Metadaten durch Neukodierung entfernen — ohne Upload.',
    trust: 'Bereinigt im Browser · kein Upload',
    tags: ['Foto', 'Datenschutz', 'PNG', 'JPG', 'WebP'],
    keywords: ['exif', 'gps', 'metadaten', 'datenschutz', 'bild', 'foto', 'standort'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild exif',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'beta',
    areas: ['bilder'],
} as const;

export default defineTool(
    {
        catalog,
        page: ImageExifStripTool,
    },
    'image-exif-strip',
);
