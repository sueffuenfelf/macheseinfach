import { defineTool } from '../types';
import { ImageDpiCheckTool } from './ImageDpiCheckTool';

const catalog = {
    id: 'image-dpi-check',
    slug: 'image-dpi-check',
    shortTitle: 'DPI prüfen',
    title: 'DPI & Bildmaße prüfen',
    sub: 'Auflösung, Dateigröße und Druck-Eignung — lokal im Browser.',
    pain: 'Unklar, ob ein Foto für Druck, Portal oder Passfoto groß genug ist.',
    solution: 'Bild hochladen — Pixel, Druckmaße und Hinweise sofort sehen.',
    trust: 'Geprüft im Browser · kein Upload',
    tags: ['DPI', 'Auflösung', 'Druck', 'Foto'],
    keywords: ['dpi prüfen', 'bildauflösung', 'pixel dpi', 'druckauflösung foto'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild dpi',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: ImageDpiCheckTool }, 'image-dpi-check');
