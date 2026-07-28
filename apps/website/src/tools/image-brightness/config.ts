import { defineTool } from '../types';
import { ImageBrightnessTool } from './ImageBrightnessTool';

const catalog = {
    id: 'image-brightness',
    slug: 'image-brightness',
    shortTitle: 'Helligkeit',
    title: 'Helligkeit & Kontrast',
    sub: 'Dunkle Fotos und Scans aufhellen — lokal im Browser.',
    pain: 'Scan oder Foto ist zu dunkel oder flau — Details kaum erkennbar.',
    solution: 'Helligkeit und Kontrast mit Live-Vorschau anpassen und exportieren.',
    trust: 'Bearbeitet im Browser · kein Upload',
    tags: ['Foto', 'Scan', 'Helligkeit', 'Kontrast'],
    keywords: ['bild aufhellen', 'helligkeit kontrast', 'scan verbessern', 'foto heller'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild helligkeit',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: ImageBrightnessTool }, 'image-brightness');
