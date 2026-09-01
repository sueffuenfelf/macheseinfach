import { defineTool } from '../types';
import { ImageToPdfTool } from './ImageToPdfTool';

const catalog = {
    id: 'image-to-pdf',
    slug: 'image-to-pdf',
    shortTitle: 'Bilder → PDF',
    title: 'Bilder als PDF',
    sub: 'Mehrere Fotos zu einer PDF — eine Seite pro Bild.',
    pain: 'Behörde oder Formular will eine PDF, du hast nur Fotos oder Screenshots.',
    solution: 'Bilder in der richtigen Reihenfolge zu einer PDF zusammenfügen.',
    trust: 'Erstellt im Browser · kein Upload',
    tags: ['PDF', 'Foto', 'Behörde', 'Dokument'],
    keywords: ['bilder zu pdf', 'fotos pdf', 'jpg pdf', 'screenshots pdf'],
    fileHints: ['heic', 'heif', 'png', 'jpg', 'jpeg', 'webp'],
    command: '/bild pdf',
    entry: 'file',
    theme: { accent: '#f4a261', accentStrong: '#000', accentSoft: '#fde8d4' },
    maturity: 'stable',
    areas: ['bilder', 'dokumente'],
} as const;

export default defineTool({ catalog, page: ImageToPdfTool }, 'image-to-pdf');
