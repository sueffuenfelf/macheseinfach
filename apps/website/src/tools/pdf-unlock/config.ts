import { defineTool } from '../types';
import { PdfUnlockTool } from './PdfUnlockTool';

const catalog = {
    id: 'pdf-unlock',
    slug: 'pdf-unlock',
    shortTitle: 'Passwort entfernen',
    title: 'PDF entsperren',
    sub: 'Eigenes passwortgeschütztes PDF entsperren — Passwort bleibt bei dir.',
    pain: 'Portal akzeptiert keine verschlüsselten PDFs.',
    solution: 'Mit dem bekannten Passwort öffnen und unverschlüsselt speichern (lokal).',
    trust: 'Entsperrt lokal · Passwort verlässt dein Gerät nicht',
    tags: ['PDF', 'Passwort', 'Entsperren'],
    keywords: ['pdf', 'passwort', 'entsperren', 'entschlüsseln', 'unlock', 'schutz'],
    fileHints: ['pdf'],
    command: '/pdf unlock',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfUnlockTool }, 'pdf-unlock');
