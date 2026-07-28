import { defineTool } from '../types';
import { IdPhotoCheckTool } from './IdPhotoCheckTool';

const catalog = {
    id: 'id-photo-check',
    slug: 'id-photo-check',
    shortTitle: 'Passfoto-Check',
    title: 'Passfoto prüfen',
    sub: 'Pixelmaße, Seitenverhältnis und Dateigröße gegen übliche Passfoto-Hinweise checken.',
    pain: 'Unklar, ob das Foto für Ausweis/Pass-Portal taugt.',
    solution: 'Bild laden — Maße und Größe lokal prüfen (kein biometrischer Amtstest).',
    trust: 'Prüft lokal · kein Upload',
    tags: ['Passfoto', 'Foto', 'Prüfen'],
    keywords: ['passfoto', 'ausweis', 'biometrisch', '35x45', 'passbild', 'größe', 'prüfen'],
    fileHints: ['jpg', 'jpeg', 'png', 'webp'],
    command: '/foto pass',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: IdPhotoCheckTool }, 'id-photo-check');
