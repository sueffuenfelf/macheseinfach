import { defineTool } from '../types';
import { PdfStampTool } from './PdfStampTool';

const catalog = {
    id: 'pdf-stamp',
    slug: 'pdf-stamp',
    shortTitle: 'Stempel / Datum',
    title: 'PDF stempelн',
    sub: 'Datum oder Kurztext auf Formulare setzen — z. B. „Eingereicht am …“.',
    pain: 'Nachweis braucht einen sichtbaren Datums- oder Statusvermerk.',
    solution: 'Textstempel platzieren und lokal speichern.',
    trust: 'Stempelt im Browser · kein Upload',
    tags: ['PDF', 'Stempel', 'Formular'],
    keywords: ['pdf', 'stempel', 'datum', 'eingereicht', 'vermerk', 'wasserzeichen'],
    fileHints: ['pdf'],
    command: '/pdf stamp',
    entry: 'file',
    theme: { accent: '#ffc900', accentStrong: '#000', accentSoft: '#fff7cf' },
    maturity: 'stable',
    areas: ['behoerden'],
    storyIds: [],
} as const;

export default defineTool({ catalog, page: PdfStampTool }, 'pdf-stamp');
