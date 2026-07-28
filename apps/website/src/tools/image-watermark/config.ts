import { defineTool } from '../types';
import { ImageWatermarkTool } from './ImageWatermarkTool';

const catalog = {
    id: 'image-watermark',
    slug: 'image-watermark',
    shortTitle: 'Wasserzeichen',
    title: 'Wasserzeichen auf Bild',
    sub: 'Text-Overlay — Position und Deckkraft einstellen.',
    pain: 'Fotos sollen vor Weitergabe mit Copyright oder Hinweis markiert werden.',
    solution: 'Text-Wasserzeichen auf Bilder setzen — lokal im Browser.',
    trust: 'Bearbeitet im Browser · kein Upload',
    tags: ['Foto', 'Wasserzeichen', 'Copyright', 'Text'],
    keywords: ['wasserzeichen bild', 'foto markieren', 'copyright foto', 'text overlay'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild wasserzeichen',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: ImageWatermarkTool }, 'image-watermark');
