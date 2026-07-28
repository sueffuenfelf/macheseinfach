import { definePasteTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { analyzeUserAgent } from './compute';

export default definePasteTool(
    {
        catalog: {
            id: 'user-agent-parse',
            slug: 'user-agent-parse',
            shortTitle: 'User-Agent lesen',
            title: 'User-Agent parsen',
            sub: 'Support: welches Gerät / welcher Browser? — lokal im Browser.',
            pain: 'Langer User-Agent-String aus einem Ticket — schwer lesbar.',
            solution: 'Einfügen — Browser, OS und Gerät grob erkannt.',
            trust: TRUST_LOCAL,
            tags: ['Dev', 'Prüfen'],
            keywords: [
                'user agent parser',
                'browser erkennen string',
                'user-agent lesen',
                'ua parser',
            ],
            fileHints: [],
            command: '/ua',
            entry: 'form',
            entryPlaceholder: 'Mozilla/5.0 …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: [],
        },
        analyze: analyzeUserAgent,
        placeholder:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        intro: TRUST_LOCAL,
    },
    'user-agent-parse',
);
