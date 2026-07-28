import { defineGenerateTool } from '../_shared/shells';
import { TRUST_LOCAL, WEB_THEME } from '../_shared/web/theme';
import { generateUuid } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'uuid-gen',
            slug: 'uuid-gen',
            shortTitle: 'UUID erzeugen',
            title: 'UUID v4 erzeugen',
            sub: 'Zufällige UUIDs für Tests und Datenbanken — lokal.',
            pain: 'Brauche schnell eine GUID / UUID für einen Test.',
            solution: 'Anzahl wählen — UUID(s) zum Kopieren.',
            trust: TRUST_LOCAL,
            tags: ['UUID', 'Dev'],
            keywords: ['uuid generator', 'guid erzeugen', 'uuid v4', 'uuid online'],
            fileHints: [],
            command: '/uuid',
            entry: 'form',
            entryPlaceholder: 'Anzahl …',
            theme: WEB_THEME,
            maturity: 'stable',
            areas: ['web'],
            storyIds: [],
        },
        fields: [
            {
                id: 'count',
                type: 'number',
                label: 'Anzahl',
                default: '1',
                placeholder: '1',
            },
        ],
        generate: generateUuid,
        isReady: (v) => {
            const n = Number(v.count ?? '1');
            return Number.isFinite(n) && n >= 1;
        },
        outputTitle: 'UUID(s)',
    },
    'uuid-gen',
);
