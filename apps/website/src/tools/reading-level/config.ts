import { definePasteTool } from '../_shared/shells';
import { analyzeReadingLevel } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'reading-level',
            slug: 'reading-level',
            shortTitle: 'Lesbarkeit',
            title: 'Lesbarkeit prüfen (Flesch DE)',
            sub: 'Wie verständlich ist der Text? Grobe Flesch-Näherung für Deutsch.',
            pain: 'Behördentext oder AGB — zu kompliziert formuliert?',
            solution: 'Text einfügen — Lesbarkeits-Index und Tipps erscheinen lokal.',
            trust: 'Lokal analysiert · nichts wird hochgeladen',
            tags: ['Text', 'Lesbarkeit', 'Schreiben'],
            keywords: [
                'lesbarkeit prüfen',
                'flesch index deutsch',
                'verständlichkeit text',
                'lesestufe',
            ],
            fileHints: [],
            command: '/lesbarkeit',
            entry: 'form',
            entryPlaceholder: 'Text einfügen …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
        },
        analyze: analyzeReadingLevel,
        placeholder: 'Behördentext, AGB oder Brief hier einfügen …',
        submitLabel: 'Lesbarkeit prüfen',
        intro: 'Näherung nach Amstad (Flesch DE). Kein linguistisches Gutachten.',
    },
    'reading-level',
);
