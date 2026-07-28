import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateCronExplain } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'cron-explain',
            slug: 'cron-explain',
            shortTitle: 'Cron erklären',
            title: 'Cron-Ausdruck erklären',
            sub: 'Was bedeutet `0 9 * * 1-5`? — deutsche Erklärung lokal.',
            pain: 'Crontab-Zeile und unsicher, wann der Job läuft.',
            solution: 'Ausdruck einfügen — lesbare Erklärung erscheint.',
            trust: TRUST_LOCAL,
            tags: ['Cron', 'Dev'],
            keywords: [
                'cron job erklären',
                'crontab generator',
                'cron syntax',
                'cron ausdruck',
            ],
            fileHints: [],
            command: '/cron',
            entry: 'form',
            entryPlaceholder: '0 9 * * 1-5',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: [],
        },
        fields: [
            {
                id: 'expr',
                type: 'text',
                label: 'Cron-Ausdruck',
                placeholder: '0 9 * * 1-5',
                default: '0 9 * * 1-5',
                mono: true,
                hint: '5 Felder (Minute Stunde Tag Monat Wochentag) oder mit Sekunden.',
            },
        ],
        generate: generateCronExplain,
        isReady: (v) => (v.expr ?? '').trim().length > 0,
        outputTitle: 'Erklärung',
    },
    'cron-explain',
);
