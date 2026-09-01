import { defineTool } from '../types';
import { ImagePassportPhotoTool } from './ImagePassportPhotoTool';

const catalog = {
    id: 'image-passport-photo',
    slug: 'image-passport-photo',
    shortTitle: 'Passfoto',
    title: 'Passfoto erstellen',
    sub: '35×45 mm — Ausschnitt wählen und als JPG exportieren.',
    pain: 'Behörde oder Online-Formular verlangt biometrisches Passfoto in festen Maßen.',
    solution: 'Foto zuschneiden und in 35×45 mm bei 300 oder 600 DPI exportieren.',
    trust: 'Exportiert im Browser · kein Upload',
    tags: ['Passfoto', 'Biometrisch', 'Behörde', 'Foto'],
    keywords: ['passfoto erstellen', 'biometrisches foto', '35x45 mm', 'passbild'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild passfoto',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder'],
} as const;

export default defineTool({ catalog, page: ImagePassportPhotoTool }, 'image-passport-photo');
