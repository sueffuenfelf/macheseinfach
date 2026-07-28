import { defineTool } from '../types';
import { PdfFormFillTool } from './PdfFormFillTool';

const catalog = {
    id: 'pdf-form-fill',
    slug: 'pdf-form-fill',
    shortTitle: 'PDF-Formular ausfüllen',
    title: 'PDF-Formular ausfüllen',
    sub: 'Behörden- und Antrags-PDFs mit ausfüllbaren Feldern — lokal ausfüllen und speichern.',
    pain: 'Das Amt schickt ein PDF-Formular — ausfüllen ohne Acrobat.',
    solution: 'AcroForm-Felder erkennen, ausfüllen und als PDF speichern.',
    trust: 'Läuft im Browser · kein Upload',
    tags: ['PDF', 'Formular', 'Upload'],
    keywords: ['formular', 'pdf', 'ausfüllen', 'antrag', 'amt', 'behoerde', 'acroform'],
    fileHints: ['pdf'],
    command: '/pdf form',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: ['story-formular-ausfuellen'],
} as const;

export default defineTool(
    {
        catalog,
        page: PdfFormFillTool,
    },
    'pdf-form-fill',
);
