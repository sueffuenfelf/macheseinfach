import { defineGenerateTool } from '../_shared/shells';
import { KOMMUNIKATION_THEME, TRUST_LOCAL } from '../_shared/kommunikation/theme';
import { generateOutOfOffice } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'out-of-office',
            slug: 'out-of-office',
            shortTitle: 'Abwesenheitsnotiz',
            title: 'Abwesenheitsnotiz erzeugen',
            sub: 'OO-Text auf Deutsch oder Englisch — für E-Mail-Autoresponder.',
            pain: 'Urlaub — schnell eine professionelle Abwesenheitsnotiz.',
            solution: 'Zeitraum und Vertretung eingeben — Text kopieren.',
            trust: TRUST_LOCAL,
            tags: ['Kommunikation', 'E-Mail', 'Schreiben'],
            keywords: ['abwesenheitsnotiz vorlage', 'out of office text', 'urlaubsnotiz email'],
            fileHints: [],
            command: '/ooo',
            entry: 'form',
            entryPlaceholder: 'Von / Bis …',
            theme: KOMMUNIKATION_THEME,
            maturity: 'stable',
            areas: ['kommunikation'],
            storyIds: [],
        },
        fields: [
            {
                id: 'lang',
                type: 'segment',
                label: 'Sprache',
                default: 'de',
                options: [
                    { value: 'de', label: 'Deutsch' },
                    { value: 'en', label: 'Englisch' },
                ],
            },
            { id: 'fromDate', type: 'text', label: 'Von', placeholder: '01.08.2026' },
            { id: 'untilDate', type: 'text', label: 'Bis', placeholder: '15.08.2026' },
            { id: 'contact', type: 'text', label: 'Vertretung', placeholder: 'kollege@firma.de' },
            {
                id: 'reason',
                type: 'textarea',
                label: 'Grund (optional)',
                placeholder: 'Ich befinde mich im Urlaub.',
                rows: 2,
            },
        ],
        generate: generateOutOfOffice,
        isReady: () => true,
        outputTitle: 'Abwesenheitsnotiz',
    },
    'out-of-office',
);
