import { defineTool } from '../types';
import { PdfA4FitTool } from './PdfA4FitTool';

const catalog = {
    id: 'pdf-a4-fit',
    slug: 'pdf-a4-fit',
    shortTitle: 'Auf A4 bringen',
    title: 'PDF auf A4 normalisieren',
    sub: 'Unterschiedliche Seitengrößen auf A4 bringen — wie Behörden es oft erwarten.',
    pain: 'Scan oder Export hat Sonderformate — Portal meckert.',
    solution: 'Jede Seite proportional auf A4 einpassen (Hoch- oder Querformat).',
    trust: 'Normalisiert lokal · kein Upload',
    tags: ['PDF', 'A4', 'Upload'],
    keywords: ['pdf', 'a4', 'seitengröße', 'normalisieren', 'format', 'amt', 'din'],
    fileHints: ['pdf'],
    command: '/pdf a4',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfA4FitTool }, 'pdf-a4-fit');
