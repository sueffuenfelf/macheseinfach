import { definePasteTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { analyzeJson } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'json-format',
            slug: 'json-format',
            shortTitle: 'JSON formatieren',
            title: 'JSON formatieren & prüfen',
            sub: 'API-Responses lesen — validieren und schön ausgeben, lokal im Browser.',
            pain: 'Minifiziertes JSON — schwer lesbar, Fehler unklar.',
            solution: 'Einfügen — Validierung und Formatierung sofort.',
            trust: TRUST_LOCAL,
            tags: ['JSON', 'Dev', 'Prüfen'],
            keywords: ['json formatter', 'json schön', 'json validate', 'json pretty'],
            fileHints: [],
            command: '/json',
            entry: 'form',
            entryPlaceholder: '{ … }',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
        },
        analyze: analyzeJson,
        placeholder: '{\n  "hello": "world"\n}',
        intro: TRUST_LOCAL,
    },
    'json-format',
);
