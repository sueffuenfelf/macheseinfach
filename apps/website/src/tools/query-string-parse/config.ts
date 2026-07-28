import { definePasteTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { analyzeQueryString } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'query-string-parse',
            slug: 'query-string-parse',
            shortTitle: 'Query-String',
            title: 'Query-String parsen',
            sub: '`?a=1&b=2` oder volle URL — Parameter lokal auflisten.',
            pain: 'Lange URL — Parameter manuell lesen ist mühsam.',
            solution: 'Einfügen — Schlüssel und Werte erscheinen sofort.',
            trust: TRUST_LOCAL,
            tags: ['Dev', 'Prüfen'],
            keywords: [
                'query string parser',
                'url parameter auslesen',
                'query params',
                'url search params',
            ],
            fileHints: [],
            command: '/qs',
            entry: 'form',
            entryPlaceholder: '?a=1&b=2',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: [],
        },
        analyze: analyzeQueryString,
        placeholder: 'https://example.com/path?foo=1&bar=hallo%20welt',
        intro: TRUST_LOCAL,
    },
    'query-string-parse',
);
