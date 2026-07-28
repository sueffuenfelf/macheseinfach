import { defineGenerateTool } from '../_shared/shells';
import { generateUmlautConvert } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'umlaut-convert',
            slug: 'umlaut-convert',
            shortTitle: 'Umlaute ersetzen',
            title: 'Umlaute ersetzen',
            sub: 'äöüß ↔ ae/oe/ue/ss — für Dateinamen und URLs.',
            pain: 'Dateiname oder URL ohne Umlaute nötig.',
            solution: 'Text einfügen — Umlaute werden lokal ersetzt.',
            trust: 'Lokal umgewandelt · nichts wird hochgeladen',
            tags: ['Text', 'Umwandeln', 'Schreiben'],
            keywords: [
                'umlaute ersetzen',
                'ä zu ae',
                'umlaut umwandeln',
                'oe ue ss',
                'dateiname umlaut',
            ],
            fileHints: [],
            command: '/umlaut',
            entry: 'form',
            entryPlaceholder: 'Text mit Umlauten …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
            storyIds: [],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Text',
                placeholder: 'z. B. Größe Maßnahme …',
                rows: 6,
            },
            {
                id: 'direction',
                type: 'segment',
                label: 'Richtung',
                default: 'to-ascii',
                options: [
                    { value: 'to-ascii', label: 'ä → ae' },
                    { value: 'from-ascii', label: 'ae → ä' },
                ],
            },
        ],
        generate: generateUmlautConvert,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Ergebnis',
    },
    'umlaut-convert',
);
