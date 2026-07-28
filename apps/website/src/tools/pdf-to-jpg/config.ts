import { defineTool } from '../types';
import { PdfToJpgTool } from './PdfToJpgTool';

const catalog = {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    shortTitle: 'PDF → Bilder',
    title: 'PDF zu JPG',
    sub: 'Seiten als JPG speichern — für Portale, die nur Bilder akzeptieren.',
    pain: 'Upload-Feld akzeptiert JPEG, du hast nur eine PDF.',
    solution: 'Jede Seite (oder einen Bereich) als JPG exportieren.',
    trust: 'Rendert lokal · kein Upload',
    tags: ['PDF', 'JPG', 'Upload'],
    keywords: ['pdf', 'jpg', 'jpeg', 'bild', 'seite', 'export', 'portal'],
    fileHints: ['pdf'],
    command: '/pdf jpg',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfToJpgTool }, 'pdf-to-jpg');
