import { defineTool } from '../types';
import { ImageCropTool } from './ImageCropTool';

const catalog = {
    id: 'image-crop',
    slug: 'image-crop',
    shortTitle: 'Zuschneiden',
    title: 'Bild zuschneiden',
    sub: 'Rechteck-Ausschnitt wählen — lokal im Browser exportieren.',
    pain: 'Rand, Wasserzeichen oder falscher Bildausschnitt — nur ein Teil soll bleiben.',
    solution: 'Ausschnitt auf dem Bild markieren und als neues Bild speichern.',
    trust: 'Zugeschnitten im Browser · kein Upload',
    tags: ['Foto', 'Zuschneiden', 'Ausschnitt', 'PNG', 'JPG'],
    keywords: ['bild zuschneiden', 'foto croppen', 'ausschnitt', 'bild crop'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild crop',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: ImageCropTool }, 'image-crop');
