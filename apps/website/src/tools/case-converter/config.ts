import { defineGenerateTool } from '../_shared/shells';
import { generateCaseConvert } from './compute';

export default defineGenerateTool(
    {
        catalog: {
            id: 'case-converter',
            slug: 'case-converter',
            shortTitle: 'Groß/Klein',
            title: 'Groß-/Kleinschreibung',
            sub: 'Text in Groß-, Klein-, Title- oder Satzschreibweise umwandeln.',
            pain: 'Überschrift falsch formatiert — alles neu tippen wäre mühsam.',
            solution: 'Text einfügen, Modus wählen — Umwandlung lokal im Browser.',
            trust: 'Lokal umgewandelt · nichts wird hochgeladen',
            tags: ['Text', 'Umwandeln', 'Schreiben'],
            keywords: [
                'großschreibung umwandeln',
                'kleinbuchstaben',
                'title case',
                'groß klein',
                'case converter',
            ],
            fileHints: [],
            command: '/case',
            entry: 'form',
            entryPlaceholder: 'Text einfügen …',
            theme: { accent: '#7dd3c0', accentStrong: '#000', accentSoft: '#e8f7f3' },
            maturity: 'stable',
            areas: ['text'],
        },
        fields: [
            {
                id: 'text',
                type: 'textarea',
                label: 'Text',
                placeholder: 'Text hier einfügen …',
                rows: 8,
            },
            {
                id: 'mode',
                type: 'segment',
                label: 'Modus',
                default: 'upper',
                options: [
                    { value: 'upper', label: 'GROSS' },
                    { value: 'lower', label: 'klein' },
                    { value: 'title', label: 'Title' },
                    { value: 'sentence', label: 'Satz' },
                ],
            },
        ],
        generate: generateCaseConvert,
        isReady: (v) => (v.text ?? '').length > 0,
        outputTitle: 'Umwandlung',
        emptyHint: 'Text einfügen — die Umwandlung erscheint hier.',
    },
    'case-converter',
);
